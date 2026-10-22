
const expenseForm = document.getElementById("expense-form");

const nameInput = document.getElementById("expense-name");
const amountInput = document.getElementById("expense-amount");
const categoryInput = document.getElementById("expense-category");

const totalExpense = document.getElementById("total-expense");
const transactionCount = document.getElementById("transaction-count");

const expenseList = document.getElementById("expense-list");
const emptyMessage = document.getElementById("empty-message");
const feedback = document.getElementById("feedback");
const clearAllButton = document.getElementById("clear-all");

let expenses = [];

try {
    const savedExpenses = JSON.parse(
        localStorage.getItem("spendwise-expenses")
    );

    if (Array.isArray(savedExpenses)) {
        expenses = savedExpenses.filter(expense =>
            expense &&
            typeof expense.id === "string" &&
            typeof expense.name === "string" &&
            typeof expense.amount === "number" &&
            Number.isFinite(expense.amount) &&
            expense.amount > 0 &&
            typeof expense.category === "string" &&
            ["Food", "Travel", "Shopping", "Education", "Other"]
                .includes(expense.category) &&
            typeof expense.date === "string"
        );
    }
} catch {
    expenses = [];
}

function saveExpenses() {
    try {
        localStorage.setItem(
            "spendwise-expenses",
            JSON.stringify(expenses)
        );

        return true;
    } catch {
        feedback.textContent =
            "Unable to save data in this browser.";

        return false;
    }
}

function formatMoney(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2
    }).format(amount);
}

function renderExpenses() {
    expenseList.replaceChildren();

    let total = 0;

    expenses.forEach(expense => {
        total += expense.amount;

        const item = document.createElement("article");
        item.className = "expense-item";

        const info = document.createElement("div");
        info.className = "expense-info";

        const title = document.createElement("h3");
        title.textContent = expense.name;

        const details = document.createElement("p");
        details.textContent = `${expense.category} · ${expense.date}`;

        info.append(title, details);

        const right = document.createElement("div");
        right.className = "expense-right";

        const amount = document.createElement("span");
        amount.className = "expense-amount";
        amount.textContent = formatMoney(expense.amount);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute(
            "aria-label",
            `Delete expense ${expense.name}`
        );

        deleteButton.addEventListener("click", () => {
            expenses = expenses.filter(
                item => item.id !== expense.id
            );

            saveExpenses();
            renderExpenses();

            feedback.textContent = "Expense deleted.";
        });

        right.append(amount, deleteButton);
        item.append(info, right);

        expenseList.appendChild(item);
    });

    totalExpense.textContent = formatMoney(total);

    transactionCount.textContent = expenses.length;

    emptyMessage.hidden = expenses.length !== 0;

    clearAllButton.disabled = expenses.length === 0;
}

expenseForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;

    if (!name) {
        feedback.textContent = "Please enter an expense name.";
        nameInput.focus();
        return;
    }

    if (
        !Number.isFinite(amount) ||
        amount <= 0 ||
        amount > 100000000
    ) {
        feedback.textContent = "Please enter a valid amount.";
        amountInput.focus();
        return;
    }

    const expense = {
        id: crypto.randomUUID(),
        name: name,
        amount: Math.round(amount * 100) / 100,
        category: category,
        date: new Date().toLocaleDateString("en-IN")
    };

    expenses.unshift(expense);

    if (!saveExpenses()) {
        expenses.shift();
        renderExpenses();
        return;
    }

    renderExpenses();

    expenseForm.reset();

    feedback.textContent = "Expense added successfully!";

    nameInput.focus();
});

clearAllButton.addEventListener("click", () => {
    if (expenses.length === 0) {
        return;
    }

    const confirmed = confirm(
        "Are you sure you want to delete all expenses?"
    );

    if (!confirmed) {
        return;
    }

    const previousExpenses = expenses;

    expenses = [];

    if (!saveExpenses()) {
        expenses = previousExpenses;
        renderExpenses();
        return;
    }

    renderExpenses();

    feedback.textContent = "All expenses cleared.";
});

renderExpenses();
