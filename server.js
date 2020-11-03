const mysql = require("mysql");
const inquirer = require("inquirer");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "employee_managementDB"
});

connection.connect(function (err) {
  if (err) throw err;

  start();
});

function start() {
  inquirer
    .prompt({
      type: "list",
      name: "command",
      message: "Choose below.",
      choices: [
        "Add a Department",
        "Add a Role",
        "Add an Employees",
        "View Departments",
        "View Roles",
        "View Employees",
        "Update Roles",
        "Exit",
      ]
    })
    .then(function (answer) {
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
        case "View Departments":
          viewDepartments();
          break;
        case "View Roles":
          viewRoles();
          break;
        case "View Employees":
          viewEmployees();
          break;
        case "Update Roles":
          updateRoles();
          break;
        case "Exit":
          connection.end();
          break;
      }
    });
};