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
    questions();
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
        name: 'choices',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            'View All Employees',
            'View All Employees by Department',
            'View All Employees by Manager',
            'Add Employee',
            'Remove Employee',
            'Update Employee Role',
            'Update Employee Manager',
            'View All Roles',
            'Add Role',
            'Remove Role',
            'Exit'
        ]
    }) .then((answer)=>{
       
       
        if (answer === 'View All Employees') {
            return viewEmployees();
        } else if (answer === 'View All Employees by Department') {
            return viewByDepartments();
        } else if (answer === 'View All Employees by Manager') {
            return viewByManager();
        } else if (answer ==='Add Employee') {
            return addEmployee();
        } else if (answer === 'Remove Employee'){
            return removeEmployee();
        } else if (answer === 'Update Employee Role'){
            return updateEmployeeRole();
        } else if (answer === 'Update Employee Manager') {
            return updateEmployeeManager();
        } else if (answer === 'View All Roles') {
            return viewRoles();
        } else if (answer === 'Add Role') {
            return addRole();
        } else if (answer === 'Remove Role') {
            return removeRole();
        } else if (answer ==='Exit') {
            return connection.end();
        };
    });
};

 function viewEmployees () { 
      let sql = `SELECT employee.id,
                        employee.first_name,
                        employee.last_name,
                        role.title,
                        department.name AS department,
                        role.salary,
                        CONCAT(manager.first_name, " ",manager.last_name) AS manager
                        FROM employee
                        LEFT JOIN role ON employee.role_id = role.id
                        LEFT JOIN department ON role.department_id = department.id 
                        LEFT JOIN employee manager ON employee.manager_id = manager.id`;
    
    connection.query(sql,(err,res) => {
        if (err) throw err;

        console.table(res);

        questions();
    });
};



function viewByDepartments() {
    var query = 'SELECT * FROM employee GROUP BY department_id';
    connection.query(query,(err,res)=>{
        if (err) throw err;
        console.log(res.length +'Employees Found!' );
        console.table('By department : ',res);
        questions();
    })
};

function viewByManager (){
    var query = 'SELECT * FROM employee GROUP BY manager_id';
    connection.query(query,(err,res)=>{
        if (err) throw err;
        console.log(res.length +'Employees Found!' );
        console.table('By manager : ',res);
        questions();
    })
};

function addEmployee(){
        connection.query('SELECT * FROM role',  (err, res)=> {
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
                    choices: [ function() {
                    var roleArray = [];
                    for (let i = 0; i < res.length; i++) {
                        roleArray.push(res[i].title);
                    }
                    return roleArray;
                    } ]
                    
                }
                ]).then((answer) =>{
                    let role_id;
                    for (let m = 0; m < res.length; m++) {
                        if (res[m].title == answer.role) {
                            role_id = res[m].id;
                            console.log(role_id)
                        }                  
                    }  
                    connection.query(
                    'INSERT INTO employee VALUES  ',
                    ({
                        first_name: answer.first_name,
                        last_name: answer.last_name,
                        manager_id: answer.manager_id,
                        role_id: role_id,
                    }),
                    function (err) {
                        if (err) throw err;
                        console.log('Your New Employee has been added!');
                        questions();
                    }
                )
            }) 
        })    
};

function removeEmployee() {

};

function updateEmployeeRole() {

}

function addRole() {
    let departmentArr = [];

    promiseMysql.createConnection(connectInfo)
    .then((cone) =>{
        return cone.query('SELECT * FROM department ORDER BY name ');
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

            connection.query(`INSERT INTO role(title,salary,department_id) 
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



