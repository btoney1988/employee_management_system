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
      message: "What would you like to do?",
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

function addDepartment() {
  inquirer
    .prompt([
      {
        name: "name",
        type: "input",
        message: "What is the departments name?"
      }
    ])
    .then(function (answer) {
      connection.query(
        "INSERT INTO department SET ?",
        { name: answer.name },
        function (err) {
          if (err) throw err;
          console.log(`New ${answer.name} department created!`)
          start();
        });
    });
};

function addRole() {
  connection.query(
    "SELECT department.name, department.id FROM employee_managmentDB.department",
    function (err, data) {
      if (err) throw err;

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
          const department_id;
          for (let i = 0; i < data.length; i++) {
            if (data[i].name === answer.department) {
              department_id = data[i].id;
              console.log(department_id);
            }
          }

          connection.query(
            "INSERT INTO role SET ?",
            {
              title: answer.title,
              salary: answer.salary,
              department_id: department_id
            },
            function (err) {
              if (err) throw err;

              console.log(`${answer.title} with salary of ${answer.salary} in ${department_id} was created!`)
              start();
            }
          );
        });
    });
};

function addEmployee() {
  connection.query(
    "SELECT role.title, role.id FROM employee_managementDB.role",
    function (err, data) {
      if (err) throw err;

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
          const role_id;
          for (let i = 0; i < data.length; i++) {
            if (data[i].title === answer.role) {
              role_id = data[i].id;
              console.log(role_id);
            }
          }
          connection.query(
            "INSERT INTO employee SET ?",
            {
              first_name: answer.first_name,
              last_name: answer.last_name,
              role_id: role_id,
            },
            function (err) {
              if (err) throw err;

              console.log
            }
          )
        })
    }
  )
};

function viewDepartments() {
  connection.query(
    "SELECT department.name FROM employee_managementDB.department",
    function (err, data) {
      if (err) throw err;

      inquirer
        .prompt([
          {
            name: "department",
            type: "list",
            message: "Please choose a department.",
            choices: function () {
              const dapartmentArr = [];
              for (let i = 0; i < data.length; i++) {
                departmentArr.push(data[i].name);
              }
              return departmentArr;
            }
          }
        ])
        .then(function (answer) {
          console.log(answer.department);

          connection.query(
            `SELECT employee.first_name, employee.last_name, role.salary, role.title, department.name as "Department Name"
             FROM employee_managementDB.employee
             INNER JOIN role ON employee.role_id = role.id
             INNER JOIN department ON role.department_id = department.id
             WHERE deparment.name LIKE "${answer.department}"`,
            function (err, data) {
              if (err) throw err;

              console.table(data);
              start();
            }
          )
        })

    }
  )
}