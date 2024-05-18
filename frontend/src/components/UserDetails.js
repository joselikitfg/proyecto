import React from 'react';
import { useUser } from '../contexts/UserContext';
import styled from 'styled-components';
import 'bootstrap/dist/css/bootstrap.min.css';

const Card = styled.div`
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  max-width: 400px;
  margin: 20px auto;
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #007bff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  margin: 0 auto 20px;
`;

const UserDetails = () => {
    const { state } = useUser();
    const { user } = state;

    if (state.loading) {
        return <div className="text-center">Loading...</div>;
    }

    if (!user) {
        return <div className="text-center">No user data available.</div>;
    }

    const { username, email, groups } = user;

    return (
        <Card className="card">
            <Avatar>{username.charAt(0).toUpperCase()}</Avatar>
            <h2 className="text-center">{username}</h2>
            <p className="text-center text-muted">{email}</p>
            <p className="text-center">
                {groups && groups.length > 0
                    ? `Groups: ${groups.join(', ')}`
                    : 'No groups assigned'}
            </p>
        </Card>
    );
};

export default UserDetails;
