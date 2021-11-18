const connection = require('./db');
const inquirer = require('inquirer');
const logo = require('asciiart-logo');
require('console.table');

init();

function init() {
    const logoText = logo({ name: "Employee Manager" }).render();

    console.log(logoText);

    loadMainPrompts();
}

function loadMainPrompts() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'What would you like to do?',
            choices: [
                { 
                    name: 'View All Employees',
                    value: 'VIEW_EMPLOYEES'
                }, 
                {
                    name: 'Add Employee',
                    value: 'ADD_EMPLOYEE'
                },
                {
                    name: 'Delete Employee',
                    value: 'DELETE_EMPLOYEE'
                },
                {
                    name: 'Update Employee Role',
                    value: 'UPDATE_ROLE'
                }, 
                {
                    name: 'View All Roles',
                    value: 'VIEW_ROLES'
                }, 
                {
                    name: 'Add Role',
                    value: 'ADD_ROLE'
                },
                {
                    name: 'Delete Role',
                    value: 'DELETE_ROLE'
                },
                {
                    name: 'View All Departments',
                    value: 'VIEW_DEPARTMENTS'
                }, 
                {
                    name: 'Add Department',
                    value: 'ADD_DEPARTMENT'
                },
                {
                    name: 'Delete Department',
                    value: 'DELETE_DEPARTMENT'
                },
                {
                    name: 'Quit',
                    value: 'QUIT'
                }
            ]
        }
    ]).then(res => {
        let choice = res.choice;

        switch (choice) {
            case "VIEW_EMPLOYEES":
                viewEmployees();
                break;
            case "ADD_EMPLOYEE":
                addEmployee();
                break;
            case "DELETE_EMPLOYEE":
                deleteEmployee();
                break;
            case "UPDATE_ROLE":
                updateRole();
                break;
            case "VIEW_ROLES":
                viewRoles();
                break;
            case "ADD_ROLE":
                addRole();
                break;
            case "DELETE_ROLE":
                deleteRole();
                break;
            case "VIEW_DEPARTMENTS":
                viewDepartments();
                break;
            case "ADD_DEPARTMENT":
                addDepartment();
                break;
            case "DELETE_DEPARTMENT":
                deleteDepartment();
                break;
            case "QUIT":
                quit();
                break;
        }
    })
};

function viewEmployees() {
    connection.promise().query(
        "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) as manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;"
    )
    .then(([rows]) => {
        let employees = rows;
        console.log("\n");
        console.table(employees);
    })
    .then(() => loadMainPrompts());
};

function addEmployee() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: "Employee's first name:"
        },
        {
            type: 'input',
            name: 'last_name',
            message: "Employee's last name:"
        }
    ])
    .then((answer) => {
        let firstName = answer.first_name;
        let lastName = answer.last_name;

        connection.promise().query(
            "SELECT department.id, department.name FROM department;"
        )
        .then(([rows]) => {
            let roles = rows;
            const roleList = roles.map(({ id, title }) => ({
                name: title,
                value: id
            }));
        
            inquirer.prompt({
                type: 'list',
                name: 'role',
                message: "What will be the employee's role?",
                choices: roleList
            })
            .then((answer) => {
                let role = answer.role;

                connection.promise().query(
                    "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) as manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;"
                )
                .then(([rows]) => {
                    let employees = rows;
                    const managerList = employees.map(({ id, first_name, last_name}) => ({
                        name: `${first_name} ${last_name}`,
                        value: id
                    }));

                    managerList.unshift({ name: 'N/A', value: null });

                    inquirer.prompt({
                        type: 'list',
                        name: 'manager',
                        message: 'Who will be the manager of this employee?',
                        choices: managerList
                    })
                    .then((answer) => {
                        let employee = {
                            manager_id: answer.manager,
                            role_id: role,
                            first_name: firstName,
                            last_name: lastName
                        }
                        connection.promise().query(
                            "INSERT INTO employee SET ?", employee
                        )
                        console.log(`${firstName} ${lastName} has been added to the database`);
                    })
                    .then(() => loadMainPrompts());
                })
            })
        })
    })
};

function deleteEmployee() {
    connection.promise().query(
        "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) as manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;"
    )
    .then(([rows]) => {
        let employees = rows;
        const employeeList = employees.map(({ id, first_name, last_name }) => ({
            name: `${first_name} ${last_name}`,
            value: id
        }));

        inquirer.prompt({
            type: 'list',
            name: 'employee',
            message: 'Which employee would you like to delete?',
            choices: employeeList
        })
        .then((answer) => {
            connection.promise().query(
                `DELETE FROM employee WHERE id = ${answer.employee}`
            );
            console.log(`Removed employee from the database`);
        })
        .then(() => loadMainPrompts());
    });
};

function viewRoles() {
    connection.promise().query(
        "SELECT role.id, role.title, role.salary, role.department_id, department.id, department.name FROM role LEFT JOIN department on role.department_id = department.id;"
    )
    .then(([rows]) => {
        let roles = rows;
        console.log("\n");
        console.table(roles)
    })
    .then(() => loadMainPrompts());
};

function addRole() {
    connection.promise().query(
        "SELECT department.id, department.name FROM department;"
    )
    .then(([rows]) => {
        let departments = rows;
        const departmentList = departments.map(({ id, name }) => ({
            name: name,
            value: id
        }));

        inquirer.prompt([
            {
                type: 'input',
                name: 'title',
                message: 'What will be the name of the role?'
            },
            {
                type: 'input',
                name: 'salary',
                message: 'What will be the salary for the role?'
            },
            {
                type: 'list',
                name: 'department_id',
                message: 'Which department will this role be assigned to?',
                choices: departmentList
            }
        ])
        .then((answer) => {
            connection.promise().query("INSERT INTO role SET ?", answer)
            console.log(`ROLE '${answer.title}' HAS BEEN ADDED.`);
        })
        .then(() => loadMainPrompts());
    })
};

function deleteRole() {
    connection.promise().query(
        "SELECT role.id, role.title, role.salary, role.department_id, department.id, department.name FROM role LEFT JOIN department on role.department_id = department.id;"
    )
    .then(([rows]) => {
        let roles = rows;
        const roleList = roles.map(({ id, title}) => ({
            name: title,
            value: id
        }));

        inquirer.prompt({
            type: 'list',
            name: 'role',
            message: 'Which role would you like to delete?',
            choices: roleList
        })
        .then((answer) => {
            connection.promise().query(
                `DELETE FROM role WHERE id = ${answer.role}`
            );
            console.log(`Removed role from the database`);
        })
        .then(() => loadMainPrompts());
    });
};

function viewDepartments() {
    connection.promise().query(
        "SELECT department.id, department.name FROM department;"
    )
    .then(([rows]) => {
        let departments = rows;
        console.log("\n");
        console.table(departments)
    })
    .then(() => loadMainPrompts());
};

function addDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Enter the name of the new department:'
        }
    ])
    .then((answer) => {
        connection.promise().query("INSERT INTO department SET ?", answer)
        console.log(`DEPARTMENT '${answer.name}' HAS BEEN ADDED.`);
    })
    .then(() => loadMainPrompts());
};

function deleteDepartment () {
    connection.promise().query(
        "SELECT department.id, department.name FROM department;"
    )
    .then(([rows]) => {
        let departments = rows;
        const departmentList = departments.map(({ id, name }) => ({
            name: name,
            value: id
        }));

        inquirer.prompt({
            type: 'list',
            name: 'department',
            message: 'Which department would you like to delete?',
            choices: departmentList
        })
        .then((answer) => {
            connection.promise().query(
                `DELETE FROM department WHERE id = ${answer.department}`
            );
            console.log(`Removed department from the database`);
        })
        .then(() => loadMainPrompts());
    });
};

function quit() {
    process.exit();
};