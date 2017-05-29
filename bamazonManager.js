var mysql = require("mysql");
var fs = require("fs");
var inquirer = require("inquirer");

const TABS_BETWEEN_NAME_AND_PRICE = 5;
const TABS_BETWEEN_PRICE_AND_STOCK = 2;

var connection = mysql.createConnection(
{
	host: "localhost",
	port: 3306,
	user: "root",
	password: "root",
	database: "Bamazon"
});

connection.connect(managerDisplay);

function managerDisplay(error)
{
	if(error)
		throw error;

	console.log("1) View Products for Sale");
	console.log("2) View Low Inventory");
	console.log("3) Add to Inventory");
	console.log("4) Add New Product");
	console.log("5) Quit");

	inquirer.prompt(
		[{
			name: "id",
			type: "input",
			message: "Please select a number option to continue"
		}]).then(parseSelection);
	
}

function parseSelection(selection)
{
	switch(selection.id)
	{
		case "1": 
		{
			connection.query("SELECT * FROM products", displayProducts);
			break;
		}
		case "2":
		{
			connection.query("SELECT * FROM products WHERE stock_quantity < 5", displayProducts);
			break;
		}
		case "3":
		{
			connection.query("SELECT * FROM products", addToProducts);
			break;
		}
		case "4":
		{
			addProduct();
			break;
		}
		case "5":
		{
			console.log("Goodbye and have a nice day. Press CTRL + C to close the program.");
			break;
		}
		default:
		{
			console.log("Unable to understand your request.");
			managerDisplay(false);
		}
	}
}

function displayProducts(error, result, isDone = true)
{
	if(error)
		throw err;

	console.log("ID\tName\t\t\t\t\tPrice\t\tQuantity");
	for(var i = 0; i < result.length; i++)
	{
		
		var productString = "";
		productString += result[i].item_id + "\t";
		productString += result[i].product_name;
		
		// This should take into account the string length and remove a number of tabs from the string to keep everything in line
		var tabCount = TABS_BETWEEN_NAME_AND_PRICE - parseInt(result[i].product_name.length / 8);
		for(var j = 0; j < tabCount; j++)
			productString += "\t";
		
		// Do the same thing for price
		var priceString = "$" + result[i].price.toFixed(2);
		productString += priceString;
		tabCount = TABS_BETWEEN_PRICE_AND_STOCK - parseInt(priceString.length / 8);
		for(var j = 0; j < tabCount; j++)
			productString += "\t";
	
		if(result[i].stock_quantity > 0)
			productString += result[i].stock_quantity;

		else
			productString += "OUT OF STOCK";
		
		console.log(productString);
	}

	if(isDone)
	{
		console.log("------------------------------------\n\n");
		managerDisplay(false);
	}
}

function addToProducts(error, result)
{
	displayProducts(error, result, false);

	inquirer.prompt(
	[{
		name: "id",
		type: "input",
		message: "Which item would you like to add stock to? (Use ID number for selection)"
	},
	{
		name: "quantity",
		type: "input",
		message: "How much stock would you like to add?"
	}]).then(function(answers)
	{
		var item = result[answers.id - 1];
		var newQuantity = parseInt(item.stock_quantity) + parseInt(answers.quantity);
		connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity: newQuantity}, {item_id: answers.id}], function(err, res)
			{
				if(err)
					throw err;

				console.log("Successfully updated " + item.product_name + " with the new stock: " + newQuantity);
				returnToMainMenu();
			});
	});
}

function addProduct()
{
	inquirer.prompt(
		[{
			name: "product_name",
			type: "input",
			message: "What is the name of the new product?"
		},
		{
			name: "department_name",
			type: "input",
			message: "What what department does the product belong to?"
		},
		{
			name: "price",
			type: "input",
			message: "What is the cost of the new product?"
		},
		{
			name: "stock_quantity",
			type: "input",
			message: "How much initial stock?"
		}]).then(function(productData)
		{
			var name = productData.product_name.toUpperCase();
			var department = productData.department_name.toUpperCase();
			connection.query("INSERT INTO products(product_name, department_name, price, stock_quantity)"
			 + "VALUES (\"" + name + "\", \"" + department + "\", " 
			 + parseFloat(productData.price).toFixed(2) + ", " + parseInt(productData.stock_quantity) + ")", function(error, result)
			 {
			 	if(error)
			 		throw error;

			 	console.log(productData.product_name + " successfully added.");
			 	returnToMainMenu();
			 });
		})
}

function returnToMainMenu()
{
	console.log("------------------------------------\n\n");
	managerDisplay(false);
}