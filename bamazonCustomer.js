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

connection.connect(customerDisplay);

function customerDisplay(error)
{
	if(error)
		throw error;

	connection.query("SELECT * FROM products", displayProducts);
}

function displayProducts(error, result)
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

	inquirer.prompt(
		[{
			name: "id",
			type: "input",
			message: "Which product number would you like to purchase?"
		},
		{
			name: "quantity",
			type: "input",
			message: "How many would you like to purchase?"
		}]).then(function(purchaseData)
		{
			var item = result[purchaseData.id - 1];
			if(item.stock_quantity >= purchaseData.quantity)
			{
				// update the data
				var newQuantity = item.stock_quantity - purchaseData.quantity;
				connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity : newQuantity}, {item_id : purchaseData.id}], function(error, result)
					{
						var cost = item.price * purchaseData.quantity;
						console.log("Purchase successful! Your purchase cost was $" + cost.toFixed(2));
						console.log("Press CTRL + C to exit");
					});
			}

			else
			{
				console.log("Unfortunately, Bamazon does not have enough " + item.product_name + " at this time. Please try again later");
				console.log("Press CTRL + C to exit.");
			}
		});
}