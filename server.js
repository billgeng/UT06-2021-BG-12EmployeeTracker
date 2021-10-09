const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');
const promiseMysql = require('promise-mysql');

const connectInfo = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '8011',
    database: 'company_db'
};

const connection = mysql.createConnection(connectInfo);

connection.connect((err) =>{
    if (err) throw err;

    console.log("\n WELCOME TO EMPLOYEE TRACKER \n")
    afterConnection();
});

afterConnection = () =>{
    console.log("***********************************")
    console.log("*                                 *")
    console.log("*        EMPLOYEE                 *")
    console.log("*        TRACKER                  *")
    console.log("*                                 *")
    console.log("***********************************")
    questions(); 
};


function questions() {
    inquirer.prompt({
        name: 'choice',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            'View All Departments',
            'View All Roles',
            'View All Employees',
            'Add a Department',
            'Add a Role',
            'Add an Employee',
            'Update Employee Role',
            'Exit'
        ]
    }) 
    .then((data) => {
        
       switch (data.choice) {
              
              case 'View All Departments':
                
              viewDepartments();
              break;

              case 'View All Roles':
                  viewRoles();
                  break;
               
              case 'View All Employees':
                  viewEmployees();
                  break;
                  
              case 'Add a Department':
                  
                  addDepartment();
                  break;
                  
              case 'Add a Role':
                  addRole();
                  break;
                  
              case 'Add an Employee':
                  addEmployee();
                  break;
                  
              case 'Update Employee Role':
                  updateEmployeeRole();
                  break;

              case 'Exit':
                  exitApp();
                  break;
              default:
                  break;        

       }
       
        
    });
};

 function viewEmployees () { 
      let sql = `SELECT employee.id,
                        employee.first_name,
                        employee.last_name,
                        roles.title,
                        department.name AS department,
                        roles.salary,
                        CONCAT(manager.first_name, " ",manager.last_name) AS manager
                        FROM employee
                        LEFT JOIN roles ON employee.role_id = roles.id
                        LEFT JOIN department ON roles.department_id = department.id 
                        LEFT JOIN employee manager ON employee.manager_id = manager.id`;
    
    connection.query(sql,(err,res) => {
        if (err) throw err;

        console.table(res);

        questions();
    });
};



function viewDepartments() {
    var query = `SELECT * FROM department`;
    connection.query(query,(err,res)=>{
        if (err) throw err;
        console.table('All department : ',res);
        questions();
    })
};

function viewRoles (){
    var query = `SELECT roles.id,roles.title,roles.salary,department.name
     FROM roles LEFT JOIN department ON roles.department_id = department.id`;
    connection.query(query,(err,res)=>{
        if (err) throw err;
        console.table('All Roles : ',res);
        questions();
    })
};

function addEmployee(){
        connection.query(`SELECT * FROM roles`,  (err, res)=> {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    name: 'first_name',
                    type: 'input', 
                    message: "What is the employee's fist name? ",
                },
                {
                    name: 'last_name',
                    type: 'input', 
                    message: "What is the employee's last name? "
                },
                {
                    name: 'manager_id',
                    type: 'input', 
                    message: "What is the employee's manager's ID? "
                },
                {
                    name: 'role', 
                    type: 'list',
                    message: "What is this employee's role? ",
                    choices:  function() {
                        var roleArray = [];
                        for (let i = 0; i < res.length; i++) {
                            roleArray.push(res[i].title);
                        }
                        return roleArray;
                    } 
                    
                }
                ]).then((answer) =>{
                    console.log(answer);
                    let role_id;
                    for (let m = 0; m < res.length; m++) {
                        if (res[m].title == answer.role) {
                            role_id = res[m].id;
                            console.log(role_id)
                        }                  
                    }  
                    connection.query(
                    `INSERT INTO employee (first_name, last_name,manager_id,role_id) VALUES ("${answer.first_name}", "${answer.last_name}", ${answer.manager_id},${role_id});`,
                   
                    function (err) {
                        if (err) throw err;
                        console.log('Your New Employee has been added!');
                        questions();
                    }
                )
            }) 
        })    
};



function updateEmployeeRole() {
 // Select all roles from table for future ref
 connection.query(
    `SELECT * FROM roles`,
    function (err, results, fields) {
        if (err) {
            console.log(err.message);
            return;
        }

        // Create empty array for storing info
        let roleArr = [];

        // for each item in the results array, push the name of the roles to the roles array
        results.forEach(item => {
            roleArr.push(item.title)
        })
        connection.query(
            `SELECT first_name, last_name FROM employee`,
            function (err, results, fields) {
                if (err) {
                    console.log(err.message);
                }

                let nameArr = [];
                results.forEach(item => {
                    nameArr.push(item.first_name);
                    nameArr.push(item.last_name);
                })
                let combinedNameArr = [];
                for (let i = 0; i < nameArr.length; i += 2) {
                    if (!nameArr[i + 1])
                        break
                    combinedNameArr.push(`${nameArr[i]} ${nameArr[i + 1]}`)
                }
                inquirer
                    .prompt([
                        {
                            type: 'list',
                            name: 'name_select',
                            message: 'Please select an employee you would like to update',
                            choices: combinedNameArr
                        },
                        {
                            type: 'list',
                            name: 'role_select',
                            message: 'Please select a role you would like your employee to change to:',
                            choices: roleArr
                        }
                    ])
                    .then((data) => {
                        let role_id;
                        for (let i = 0; i < roleArr.length; i++) {
                            if (data.role_select === roleArr[i]) {
                                role_id = i + 1;
                            }
                        };
                        let selectedNameArr = data.name_select.split(" ");
                        let last_name = selectedNameArr.pop();
                        let first_name = selectedNameArr[0];

                        connection.query(
                            `UPDATE employee 
                                    SET role_id = ?
                                    WHERE first_name = ? AND last_name = ?`,
                            [role_id, first_name, last_name],
                            function (err, results, fields) {
                                if (err) {
                                    console.log(err.message);
                                    return;
                                }
                                console.log('Employee updated!');
                                questions();
                            }
                        );
                    });
            }
        );

    }
);
};

function addDepartment() {
    inquirer
        .prompt({
            type: 'text',
            name: 'dep_name',
            message: 'Please enter the name of the department you would like to add: '
        })
        .then((data) => {
            connection.query(
                `INSERT INTO department (name)
                VALUES(?)`,
                [data.dep_name],
                function (err, results, fields) {
                    if (err) {
                        console.log(err.message);
                        return;
                    }

                    console.log('Added department!');
                    questions();
                }
            )
        })
}

function addRole() {
    let departmentArr = [];

    promiseMysql.createConnection(connectInfo)
    .then((cone) =>{
        return cone.query(`SELECT * FROM department `);
    }).then ((departments) =>{
        for (i=0;i<departments.length;i++){
            departmentArr.push (departments[i].name);
        }

        return departments;
    }).then ((departments)=>{
        inquirer 
        .prompt ([
            {
                name : 'roleTitle',
                type: 'input',
                message: 'What is new role title?'
            },
            {
                name: 'salary',
                type : 'number',
                message: 'What is the salary of new title?'
            },
            {
                name: 'dept',
                type: 'list',
                message: 'which department does new title belong to ?',
                choices: departmentArr
            }
        ]).then ((answer) => {
            let dept_id;

            for (i= 0; i<departments.length;i++) {
                if (answer.dept == departments[i].name) {
                    dept_id = departments[i].id;
                }
            }

            connection.query(`INSERT INTO roles(title,salary,department_id) 
            VALUES( "${answer.roleTitle}",${answer.salary},${dept_id})`,(err,res)=>{
                if (err) throw err;
                console.log(`\n Role ${answer.roleTitle} is added . \n`);
                questions();
            });
        });
    });
}

function exitApp(){
    connection.end();
};



