INSERT INTO department (name) 
VALUES
('Information Systems and Technology'),
('Finance'),
('Legal'),
('Human Resources'),
('Sales');

INSERT INTO roles (title,salary,department_id)
VALUES
('Web Developer',85000,1),
('Accountant',65000,2),
('Lawyer',125000,3),
('HR Manager',100000,4),
('Sales Rep',75000,5),
('Sales Manager',118000,5);


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('Devin', 'Sanchez',1,1),
('John', 'Smith',4,NULL),
('Ronadle', 'Chen',2,NULL),
('Maria', 'Hall',2,3),
('Lina', 'Wilson',6,NULL),
('David', 'Green',5,5),
('Taylor', 'Moore',3,NUll);








