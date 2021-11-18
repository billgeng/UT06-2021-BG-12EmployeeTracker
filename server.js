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
    console.log("*****************************************")
    console.log("*                                       *")
    console.log("*              EMPLOYEE                 *")
    console.log("*              TRACKER                  *")
    console.log("*                                       *")
    console.log("*****************************************")
    questions(); 
};


function questions() {
    inquirer.prompt({
        name: 'choice',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            'View All Employees',
            'View All Departments',
            'View All Roles',
            'View Employees By Department',
            'View Department Budgets',
            'Add a Department',
            'Add a Role',
            'Add an Employee',
            'Update Employee Role',
            'Remove Employee',
            'Remove a Role',
            'Exit'
        ]
    }) 
    .then((data) => {
        
       switch (data.choice) {
              
              case 'View All Departments':
               
              viewDepartments();
              break;

              case 'View All Roles':
                  viewAllRoles();
                  break;
               
              case 'View All Employees':
                  viewAllEmployees();
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

              case 'View Employees By Department' :
                  viewEmployeesByDepartment();
                  break;
                  
               case 'View Department Budgets':
                   viewDepartmentBudget();
                   break;   

                case 'Remove Employee':
                    removeEmployee();
                    break;
                    
                case 'Remove a role':
                    removeRole();
                    break;    

              case 'Exit':
                  exitApp();
                  break;
              default:
                  break;        

       }
       
        
    });
};

 function viewAllEmployees () { 
      let sql = `SELECT employee.id,
                        employee.first_name,
                        employee.last_name,
                        roles.title,
                        department.department_name AS department,
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

function viewAllRoles (){
    var query = `SELECT roles.id,roles.title,roles.salary,department.department_name
     FROM roles LEFT JOIN department ON roles.department_id = department.id`;
    connection.query(query,(err,res)=>{
        if (err) throw err;
        console.table('All Roles : ',res);
        questions();
    })
};




function addEmployee(){
inquirer.prompt([
    {
      type: 'input',
      name: 'first_name',
      message: "What is the employee's first name?",
      
    },
    {
      type: 'input',
      name: 'last_name',
      message: "What is the employee's last name?",
      
    }
  ])
    .then(answer => {
    const crit = [answer.first_name, answer.last_name]
    const roleSql = `SELECT roles.id, roles.title FROM roles`;
    connection.query(roleSql, (error, data) => {
      if (error) throw error; 
      const roles = data.map(({ id, title }) => ({ name: title, value: id }));
      inquirer.prompt([
            {
              type: 'list',
              name: 'role',
              message: "What is the employee's role?",
              choices: roles
            }
          ])
            .then(roleChoice => {
              const role = roleChoice.role;
              crit.push(role);
              const managerSql =  `SELECT * FROM employee`;
              connection.query(managerSql, (error, data) => {
                if (error) throw error;
                const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
                inquirer.prompt([
                  {
                    type: 'list',
                    name: 'manager',
                    message: "Who is the employee's manager?",
                    choices: managers
                  }
                ])
                  .then(managerChoice => {
                    const manager = managerChoice.manager;
                    crit.push(manager);
                    const sql =   `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                  VALUES (?, ?, ?, ?)`;
                    connection.query(sql, crit, (error) => {
                    if (error) throw error;
                    console.log("Employee has been added!")
                    viewAllEmployees();
              });
            });
          });
        });
     });
  });
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
                `INSERT INTO department (department_name)
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
            departmentArr.push (departments[i].department_name);
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
                type : 'input',
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
                if (answer.dept == departments[i].department_name) {
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

// View all Employees by Department
const viewEmployeesByDepartment = () => {
    const sql =     `SELECT employee.first_name, 
                    employee.last_name, 
                    department.department_name AS department
                    FROM employee 
                    LEFT JOIN roles ON employee.role_id = role_id 
                    LEFT JOIN department ON roles.department_id = department_id`;
    connection.query(sql, (error, response) => {
      if (error) throw error;
      console.table(response);
      questions();
      });
  };
  
  //View all Departments by Budget
  const viewDepartmentBudget = () => {
    
    const sql =     `SELECT department_id AS id, 
                    department.department_name AS department,
                    SUM(salary) AS budget
                    FROM  roles  
                    INNER JOIN department ON roles.department_id = department_id GROUP BY  roles.department_id`;
    connection.query(sql, (error, response) => {
      if (error) throw error;
        console.table(response);
       
        questions();
    });
  };

// Delete an Employee
const removeEmployee = () => {
    let sql =     `SELECT employee.id, employee.first_name, employee.last_name FROM employee`;

    connection.query(sql, (error, response) => {
      if (error) throw error;
      let employeeNamesArray = [];
      response.forEach((employee) => {employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`);});

      inquirer
        .prompt([
          {
            name: 'chosenEmployee',
            type: 'list',
            message: 'Which employee would you like to remove?',
            choices: employeeNamesArray
          }
        ])
        .then((answer) => {
          let employeeId;

          response.forEach((employee) => {
            if (
              answer.chosenEmployee ===
              `${employee.first_name} ${employee.last_name}`
            ) {
              employeeId = employee.id;
            }
          });

          let sql = `DELETE FROM employee WHERE employee.id = ?`;
          connection.query(sql, [employeeId], (error) => {
            if (error) throw error;
           
            viewAllEmployees();
          });
        });
    });
  };

  // Delete a Role
const removeRole = () => {
    let sql = `SELECT role.id, role.title FROM roles`;

    connection.query(sql, (error, response) => {
      if (error) throw error;
      let roleNamesArray = [];
      response.forEach((role) => {roleNamesArray.push(role.title);});

      inquirer
        .prompt([
          {
            name: 'chosenRole',
            type: 'list',
            message: 'Which role would you like to remove?',
            choices: roleNamesArray
          }
        ])
        .then((answer) => {
          let roleId;

          response.forEach((role) => {
            if (answer.chosenRole === role.title) {
              roleId = role.id;
            }
          });

          let sql =   `DELETE FROM roles WHERE role.id = ?`;
          connection.query(sql, [roleId], (error) => {
            if (error) throw error;
            
            viewAllRoles();
          });
        });
    });
  };

function exitApp(){
    connection.end();
};



