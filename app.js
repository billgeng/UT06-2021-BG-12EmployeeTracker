const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');


const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '8011',
    database: 'company_db'
})

connection.connect((err) =>{
    if (err) throw err;
    questions();
})

function questions() {
    inquirer.prompt({
        name: 'modify',
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
            return exitApp();
        }
    })
};

function viewEmployees() {
    var query = 'SELECT * FROM employee';
    connection.query(query,(err,res)=>{
        if (err) throw err;
        console.log(res.length + 'Employees Found!');
        console.table('Company All Employees : ',res);
        questions();
    })
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


function exitApp(){
    connection.end();
};

