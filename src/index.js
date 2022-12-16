const { response } = require("express");
const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const customers = [];

function verifyIfAccountExists(request, response, next) {
    const { cpf } = request.headers;
    const customer = customers.find((customer) => customer.cpf === cpf);

    if (!customer) {
        return response.status(400).json({ error: "Customer not found!" });
    }

    request.customer = customer;

    return next();
}

function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if (operation.type === 'credit') {
            return acc + operation.amount;
        } else {
            return acc - operation.amount;
        }
    })

    return balance;
}

app.post("/account", (request, response) => {
    const { cpf, name } = request.body;
    const customerAlredyExists = customers.some((customer) => customer.cpf === cpf);

    if (customerAlredyExists) {
        return response.status(400).json({ "error": "Customer alredy exists!" });
    }

    const customer = {
        id: uuidv4(),
        name,
        cpf,
        statement: []
    }

    customers.push(customer);

    return response.status(201).json(customer);
});

app.post("/deposit", verifyIfAccountExists, (request, response) => {
    const { description, amount } = request.body;
    const { customer } = request;

    const statementOp = {
        description,
        amount,
        created_at: Date(),
        type: "credit"
    }

    customer.statement.push(statementOp);

    return response.status(201).send();
});

app.post("/withdraw", verifyIfAccountExists, (request, response) => {
    const { amount } = request.body;
    const { customer } = request;

    const balance = getBalance(customer.statement);

    if (balance < amount) {
        return response.status(400).json({ error: "insufficient founds!" });
    }

    const statementOp = {
        description,
        amount,
        created_at: Date(),
        type: "debit"
    }

    customer.statement.push(statementOp);

    return response.status(201).send();
});

app.get("/statement", verifyIfAccountExists, (request, response) => {
    const { customer } = request;

    return response.json(customer.statement);
});

app.listen(3333);