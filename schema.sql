DROP DATABASE IF EXISTS company_db;
CREATE DATABASE company_db;

USE company_db;

DROP TABLE IF EXISTS department;

DROP TABLE IF EXISTS roles;

DROP TABLE IF EXISTS employee;

CREATE TABLE department (
    id INTEGER NOT NULL AUTO_INCREMENT,
    department_name VARCHAR(60) NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE roles (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INTEGER ,
    FOREIGN KEY (department_id) REFERENCES department(id) 
    
);


CREATE TABLE employee (
    id INTEGER  NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INTEGER ,
    manager_id INTEGER,
    PRIMARY KEY(id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ,
    FOREIGN KEY (manager_id) REFERENCES roles(id) ON DELETE SET NULL
    
);




