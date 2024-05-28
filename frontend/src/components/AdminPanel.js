import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../contexts/UserContext";
import { Table, Button, Spinner, Alert } from "react-bootstrap";

const AdminPanel = () => {
  const { state } = useUser();
  const { user } = state;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || !user.groups || !user.groups.includes("Admin")) {
        setError("You do not have permission to view this page.");
        setLoading(false);
        return;
      }

      if (!user.email) {
        setError("User email is not defined.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("https://alccm18ogi.execute-api.eu-west-1.amazonaws.com/Prod/users", {
          params: {
            email: user.email
          }
        });

        const userList = response.data;

        // Fetch groups for each user
        const usersWithGroups = await Promise.all(
          userList.map(async (u) => {
            const groupsResponse = await axios.get(
              `https://alccm18ogi.execute-api.eu-west-1.amazonaws.com/Prod/users/${u.Email}/groups`,
              {
                params: {
                  admin_email: user.email
                }
              }
            );
            return {
              ...u,
              groups: groupsResponse.data.groups,
            };
          })
        );

        setUsers(usersWithGroups);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  const handleAddToGroup = async (email, groupName) => {
    if (!user.email) {
      alert("User email is not defined.");
      return;
    }

    try {
      await axios.post(
        `https://alccm18ogi.execute-api.eu-west-1.amazonaws.com/Prod/users/add-to-group`,
        {
          email,
          groupName,
          admin_email: user.email
        }
      );

      alert("User added to group successfully!");

      // Update user group locally
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.Email === email ? { ...u, groups: [...u.groups, groupName] } : u
        )
      );
    } catch (err) {
      alert(`Error adding user to group: ${err.message}`);
    }
  };

  const handleRemoveFromGroup = async (email, groupName) => {
    if (!user.email) {
      alert("User email is not defined.");
      return;
    }

    try {
      await axios.post(
        `https://alccm18ogi.execute-api.eu-west-1.amazonaws.com/Prod/users/remove-from-group`,
        {
          email,
          groupName,
          admin_email: user.email
        }
      );

      alert("User removed from group successfully!");

      // Update user group locally
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.Email === email
            ? { ...u, groups: u.groups.filter((g) => g !== groupName) }
            : u
        )
      );
    } catch (err) {
      alert(`Error removing user from group: ${err.message}`);
    }
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">Error: {error}</Alert>;

  return (
    <div className="container mt-5">
      <h2>Admin Panel</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Email</th>
            <th>Username</th>
            <th>Groups</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.Email}>
              <td>{user.Email}</td>
              <td>{user.Username}</td>
              <td>{user.groups.join(", ")}</td>
              <td>
                <Button
                  onClick={() => handleAddToGroup(user.Email, "Admin")}
                  disabled={user.groups.includes("Admin")}
                  className="m-1"
                >
                  Add to Admin
                </Button>
                <Button
                  onClick={() => handleAddToGroup(user.Email, "Collaborator")}
                  disabled={user.groups.includes("Collaborator")}
                  className="m-1"
                >
                  Add to Collaborator
                </Button>
                <Button
                  onClick={() => handleRemoveFromGroup(user.Email, "Admin")}
                  disabled={!user.groups.includes("Admin")}
                  className="m-1"
                  variant="danger"
                >
                  Remove from Admin
                </Button>
                <Button
                  onClick={() =>
                    handleRemoveFromGroup(user.Email, "Collaborator")
                  }
                  disabled={!user.groups.includes("Collaborator")}
                  className="m-1"
                  variant="danger"
                >
                  Remove from Collaborator
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default AdminPanel;
