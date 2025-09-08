import React, { useState } from "react";
import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

const initialTransactions = [
  {
    id: 1,
    type: "Deposit",
    sender: "System",
    receiver: "Wallet",
    amount: 1000,
    status: "Completed",
    date: "2025-08-28",
  },
];

export const PaymentsPage: React.FC = () => {
  const [balance, setBalance] = useState(1000);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw" | "transfer" | "fund">("deposit");
  const [form, setForm] = useState({ amount: 0, desc: "", to: "", from: "" });

  const handleTransaction = (type: string) => {
    if (form.amount <= 0) return;

    let newBalance = balance;
    if (type === "Deposit") newBalance += form.amount;
    if (type === "Withdraw") newBalance -= form.amount;
    if (type === "Transfer") newBalance -= form.amount;
    if (type === "Fund") newBalance -= form.amount;

    setBalance(newBalance);

    const newTx = {
      id: transactions.length + 1,
      type,
      sender: form.from || (type === "Deposit" ? "Investor" : "Wallet"),
      receiver: form.to || (type === "Deposit" ? "Wallet" : "Entrepreneur"),
      amount: form.amount,
      status: "Completed",
      date: new Date().toISOString().split("T")[0],
    };

    setTransactions([newTx, ...transactions]);
    setForm({ amount: 0, desc: "", to: "", from: "" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Wallet Balance */}
      <Card>
        <CardBody className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Available Balance</h2>
            <p className="text-3xl font-bold">${balance.toFixed(2)} USD</p>
          </div>
          <Button>Manage Funds</Button>
        </CardBody>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </CardHeader>
        <CardBody className="flex gap-3">
          <Button variant={activeTab === "deposit" ? "primary" : "outline"} onClick={() => setActiveTab("deposit")}>
            Deposit
          </Button>
          <Button variant={activeTab === "withdraw" ? "primary" : "outline"} onClick={() => setActiveTab("withdraw")}>
            Withdraw
          </Button>
          <Button variant={activeTab === "transfer" ? "primary" : "outline"} onClick={() => setActiveTab("transfer")}>
            Transfer
          </Button>
          <Button variant={activeTab === "fund" ? "primary" : "outline"} onClick={() => setActiveTab("fund")}>
            Fund Deal
          </Button>
        </CardBody>
      </Card>

      {/* Active Form */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">
            {activeTab === "deposit" && "Deposit Funds"}
            {activeTab === "withdraw" && "Withdraw Funds"}
            {activeTab === "transfer" && "Transfer Funds"}
            {activeTab === "fund" && "Fund a Deal (Investor → Entrepreneur)"}
          </h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Amount (USD)</label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
              className="mt-1 block w-full border rounded-md px-3 py-2"
            />
          </div>

          {(activeTab === "transfer" || activeTab === "fund") && (
            <>
              <div>
                <label className="block text-sm font-medium">From</label>
                <input
                  type="text"
                  value={form.from}
                  onChange={(e) => setForm({ ...form, from: e.target.value })}
                  placeholder="Sender name"
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">To</label>
                <input
                  type="text"
                  value={form.to}
                  onChange={(e) => setForm({ ...form, to: e.target.value })}
                  placeholder="Receiver name"
                  className="mt-1 block w-full border rounded-md px-3 py-2"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium">Description (Optional)</label>
            <input
              type="text"
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              className="mt-1 block w-full border rounded-md px-3 py-2"
            />
          </div>

          <Button onClick={() => handleTransaction(
            activeTab === "deposit" ? "Deposit" :
            activeTab === "withdraw" ? "Withdraw" :
            activeTab === "transfer" ? "Transfer" :
            "Fund"
          )}>
            {activeTab === "deposit" && "Deposit"}
            {activeTab === "withdraw" && "Withdraw"}
            {activeTab === "transfer" && "Transfer"}
            {activeTab === "fund" && "Send Funds"}
          </Button>
        </CardBody>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
        </CardHeader>
        <CardBody>
          <table className="w-full text-sm">
            <thead className="text-gray-600">
              <tr className="text-left border-b">
                <th className="p-2">Type</th>
                <th className="p-2">Sender</th>
                <th className="p-2">Receiver</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Status</th>
                <th className="p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b">
                  <td className="p-2">{tx.type}</td>
                  <td className="p-2">{tx.sender}</td>
                  <td className="p-2">{tx.receiver}</td>
                  <td className="p-2 font-medium">${tx.amount}</td>
                  <td className="p-2">
                    <Badge variant="secondary" size="sm">
                      {tx.status}
                    </Badge>
                  </td>
                  <td className="p-2">{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
};
