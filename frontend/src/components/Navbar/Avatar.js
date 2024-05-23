import React, { useState } from 'react';
import styled from 'styled-components';

const UserName = styled.p`
  margin: 0;
  padding: 0;
  font-weight: bold;
`;

const AppVersion = styled.p`
  margin: 0;
  padding: 0;
  color: gray;
  font-size: 0.8em;
`;

const AvatarContainer = styled.div`
  position: relative;
  cursor: pointer;
  margin-left: 20px;
`;

const AvatarImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 20px;
`;

const MenuItem = styled.a`
  margin-top: 10px;
  padding: 5px 10px;
  color: #007bff;
  text-decoration: none;
  cursor: pointer;
  width: 100%;
  text-align: center;

  &:hover {
    background-color: #f0f0f0;
    border-radius: 5px;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 90px; /* Ajustado para el nuevo tamaño del avatar */
  right: 0;
  background-color: white;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  padding: 10px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 200px; /* Ancho aumentado */
  
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    right: 10px;
    border-width: 0 10px 10px 10px;
    border-style: solid;
    border-color: transparent transparent white transparent;
  }
`;

const Avatar = ({ userName, appVersion, onSignOut, onUserDetails }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <AvatarContainer onClick={() => setIsOpen(!isOpen)}>
            <AvatarImage src="https://avataaars.io/?avatarStyle=Circle&topType=Hat&accessoriesType=Kurt&facialHairType=BeardLight&facialHairColor=Black&clotheType=BlazerSweater&eyeType=Dizzy&eyebrowType=RaisedExcited&mouthType=Default&skinColor=Light" alt="avatar" />
            {isOpen && (
                <DropdownMenu>
                    <UserName>{userName}</UserName>
                    <MenuItem onClick={onUserDetails}>User Details</MenuItem>
                    <MenuItem onClick={onSignOut}>Sign Out</MenuItem>
                    <div className='mt-2'></div>
                    <AppVersion>{appVersion}</AppVersion>
                </DropdownMenu>
            )}
        </AvatarContainer>
    );
};
export default Avatar;