// Dependencies
const mysql = require("mysql");
const inquirer = require("inquirer");

// Setting up connection
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "employee_managementDB"
});

// Connecting to server
connection.connect(function (err) {
  if (err) throw err;

  console.log("Server listening");

  // Calling start function to run the application
  start();
});

// Start function that presents user with actions for the employee management
function start() {
  // Inquirer to list the choices options the app is capable of
  inquirer
    .prompt({
      type: "list",
      name: "command",
      message: "What would you like to do?",
      choices: [
        "Add a Department",
        "Add a Role",
        "Add an Employee",
        "Veiw employees by department",
        "View employees by role",
        "View all employees",
        "Update Roles",
        "Exit",
      ]
    })
    .then(function (answer) {
      // Switch function to run correct function based off user input
      switch (answer.command) {
        case "Add a Department":
          addDepartment();
          break;
        case "Add a Role":
          addRole();
          break;
        case "Add an Employee":
          addEmployee();
          break;
        case "Veiw employees by department":
          viewDepartments();
          break;
        case "View employees by role":
          viewRoles();
          break;
        case "View all employees":
          viewEmployees();
          break;
        case "Update Roles":
          updateRoles();
          break;
        case "Exit":
          // If exit is selected then the connection will end
          connection.end();
          break;
      }
    });
};
// Add department function
function addDepartment() {
  // Inquirer to get the department information
  inquirer
    .prompt([
      {
        name: "name",
        type: "input",
        message: "What is the departments name?"
      }
    ])
    .then(function (answer) {
      // Connection query to insert the department information into department table
      connection.query(
        `INSERT INTO department 
         SET ?`,
        { name: answer.name },
        function (err) {
          if (err) throw err;
          // Console log will show success
          console.log(`New ${answer.name} department created!`);
          // Return to start menu
          start();
        });
    });
};
// Add role function 
function addRole() {
  // Connection query selecting the correct information from the department table
  connection.query(
    `SELECT department.name, department.id 
     FROM employee_managementDB.department`,

    function (err, data) {
      if (err) throw err;
      // Inquirer receiving the correct role information
      inquirer
        .prompt([
          {
            name: "title",
            type: "input",
            message: "Please input role name"
          },
          {
            name: "salary",
            type: "input",
            message: "Please input salary"
          },
          {
            name: "department",
            type: "list",
            message: "Which department?",
            // Function to list the deparments from the department table
            choices: function () {
              const departmentArr = [];
              const departmentArrID = [];
              for (let i = 0; i < data.length; i++) {
                departmentArr.push(data[i].name);
                departmentArrID.push(data[i].id);
              }
              return departmentArr;
            }
          },
        ])
        .then(function (answer) {
          let department_id;
          // Searching through the department table for the correct department based on user input and return the department ID
          for (let i = 0; i < data.length; i++) {
            if (data[i].name === answer.department) {
              department_id = data[i].id;
              console.log(department_id);
            }
          }
          // Connection query to insert the role information
          connection.query(
            `INSERT INTO role 
             SET ?`,
            {
              title: answer.title,
              salary: answer.salary,
              department_id: department_id
            },
            function (err) {
              if (err) throw err;
              // Console log will show success
              console.log(`${answer.title} with salary of ${answer.salary} in ${department_id} was created!`)
              // Return to start menu
              start();
            }
          );
        });
    });
};
// Add employee function
function addEmployee() {
  // Connection query recieving role information
  connection.query(
    `SELECT role.title, role.id 
     FROM employee_managementDB.role`,

    function (err, data) {
      if (err) throw err;
      // Inquirer to recieve correct employee information
      inquirer
        .prompt([
          {
            name: "first_name",
            type: "input",
            message: "Please enter first name of employee."
          },
          {
            name: "last_name",
            type: "input",
            message: "Please enter last name of employee."
          },
          {
            name: "role",
            type: "list",
            message: "Please choose a role.",
            // Function to list the current roles from the role table
            choices: function () {
              const roleArr = [];
              for (let i = 0; i < data.length; i++) {
                roleArr.push(data[i].title);
              }
              return roleArr;
            }
          },
        ])
        .then(function (answer) {
          console.log(answer.role);
          let role_id;
          // Searching through role table for correct role based on user input to return the role id
          for (let i = 0; i < data.length; i++) {
            if (data[i].title === answer.role) {
              role_id = data[i].id;
              console.log(role_id);
            }
          }
          // Connection query to insert new employee into the employee table based on user input
          connection.query(
            `INSERT INTO employee 
             SET ?`,
            {
              first_name: answer.first_name,
              last_name: answer.last_name,
              role_id: role_id,
            },
            function (err) {
              if (err) throw err;
              // Console log success
              console.log(`Employee ${answer.first_name} ${answer.last_name} was created`);
              // Return to start menu
              start();
            }
          )
        })
    }
  )
};
// View department function
function viewDepartments() {
  // Connection query selecting correct information from the department table
  connection.query(
    `SELECT department.name 
     FROM employee_managementDB.department`,
    function (err, data) {
      if (err) throw err;
      // Inquirer to get correct department to view from user
      inquirer
        .prompt([
          {
            name: "department",
            type: "list",
            message: "Please choose a department.",
            // Function listing out departments for user to select from
            choices: function () {
              const departmentArr = [];
              for (let i = 0; i < data.length; i++) {
                departmentArr.push(data[i].name);
              }
              return departmentArr;
            }
          }
        ])
        .then(function (answer) {
          console.log(answer.department);
          // Connection query to select and join the correct information from the three tables
          connection.query(
            `SELECT employee.first_name, employee.last_name, role.salary, role.title, department.name as "Department Name"
             FROM employee_managementDB.employee
             INNER JOIN role ON employee.role_id = role.id
             INNER JOIN department ON role.department_id = department.id
             WHERE department.name LIKE "${answer.department}"`,
            function (err, data) {
              if (err) throw err;
              // Console log the table
              console.table(data);
              // Return to start menu
              start();
            }
          );
        });

    });
};
// View role function
function viewRoles() {
  // Connection query to select the correct information from the role table
  connection.query(
    `SELECT role.title 
     FROM employee_managementDB.role`,
    function (err, data) {
      if (err) throw err;
      // Inquirer to select which role to view by
      inquirer
        .prompt([
          {
            name: "role",
            type: "list",
            message: "Please choose a role.",
            // Function to list the roles from the role table
            choices: function () {
              const roleArr = [];
              for (let i = 0; i < data.length; i++) {
                roleArr.push(data[i].title);
              }
              return roleArr;
            }
          },
        ])
        .then(function (answer) {
          console.log(answer.role);
          // Connection query to select and join correct information for the three tables
          connection.query(
            `SELECT employee.first_name, employee.last_name, role.salary, role.title, department.name as "Department Name"
             FROM employee_managementDB.employee
             INNER JOIN role ON employee.role_id = role.id
             INNER JOIN department ON role.department_id = department.id
             WHERE role.title LIKE "${answer.role}"`,
            function (err, data) {
              if (err) throw err;
              // Console log the table that was created
              console.table(data);
              // Return to start menu
              start();
            }
          );
        });
    });
};
// View employees function
function viewEmployees() {
  // Connection query to selectand join correct information from the three tables
  connection.query(
    `SELECT employee.first_name, employee.last_name, role.salary, role.title, department.name as "Department Name"
     FROM employee_managementDB.employee
     INNER JOIN role ON employee.role_id = role.id
     INNER JOIN department ON role.department_id = department.id`,

    function (err, data) {
      if (err) throw err;
      // Console log the table
      console.table(data);
      // Return to start menu
      start();
    }
  );
};
// Update roles function 
function updateRoles() {
  // Connection query to select and join the correct information from the three tables
  connection.query(
    `SELECT employee.first_name, employee.last_name, role.salary, role.title, role.id, department.name as "Department Name"
     FROM employee_managementDB.employee
     INNER JOIN role ON employee.role_id = role.id
     INNER JOIN department ON role.department_id = department.id`,

    function (err, data) {
      if (err) throw err;
      // Inquirer to get correct information from the user
      inquirer
        .prompt([
          {
            name: "employee",
            type: "list",
            message: "Please choose an employee to update.",
            // Function to list the employees from the employee list
            choices: function () {
              const employeeArr = [];
              for (let i = 0; i < data.length; i++) {
                employeeArr.push(`${data[i].first_name} ${data[i].last_name}`)
              }
              return employeeArr;
            }
          }
        ])
        .then(function (answer) {
          // Connection query to select the correct information from the role table
          connection.query(
            `SELECT role.title, role.id, role.salary
             FROM employee_managementDB.role`,

            function (err, data) {
              if (err) throw err;
              // Inquirer to get correct information from the user
              inquirer
                .prompt([
                  {
                    name: "newRole",
                    type: "list",
                    message: "Please choose new role for employee",
                    // Function to list the roles for the user to pick from
                    choices: function () {
                      const roleArr = [];
                      for (let i = 0; i < data.length; i++) {
                        roleArr.push(data[i].title);
                      }
                      return roleArr;
                    }
                  }
                ])
                .then(function (answer2) {
                  let role_id, employee_id;
                  // Connection query to select correct information from the employee table
                  connection.query(
                    `SELECT employee.first_name, employee.last_name, employee.id
                     FROM employee_managementDB.employee`,

                    function (err, data2) {
                      if (err) throw err;
                      // Searching through the employee table to match the correct employee that the user chose
                      for (let i = 0; i < data2.length; i++) {
                        if (`${data2[i].first_name} ${data2[i].last_name}` === answer.employee) {
                          employee_id = data2[i].id;
                        }
                      }
                      // Connection query tp select correct information from the role table
                      connection.query(
                        `SELECT role.title, role.salary, role.id
                          FROM employee_managementDB.role`,

                        function (err, data3) {
                          if (err) throw err;
                          // Searching through the role table to match the role based on user input
                          for (let i = 0; i < data3.length; i++) {
                            if (`${data3[i].title}` === answer2.newRole) {
                              role_id = data3[i].id;
                            }
                          }
                          // Connection query updating the employee table based on user input
                          connection.query(
                            `UPDATE employee
                             SET ?
                             WHERE ?`,
                            [
                              {
                                role_id: role_id
                              },
                              {
                                id: employee_id
                              }
                            ],
                            function (err) {
                              if (err) throw err;
                              // Console log success
                              console.log("Role Changed!");
                              // Return to start menu
                              start();
                            }
                          )
                        }
                      )
                    }
                  )
                })
            });
        });
    });
};