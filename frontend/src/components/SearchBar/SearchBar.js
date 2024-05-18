import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

const SearchContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 100%;
  margin: 20px 0;
`;

const SearchIcon = styled(motion.div)`
  cursor: pointer;
  font-size: 2.5rem;
  margin-right: 20px;
  color: #ff6347; /* Color temático */
`;

const SearchInput = styled(motion.input)`
  padding: 10px 20px;
  font-size: 1.5rem;
  border: 2px solid #ccc;
  border-radius: 4px;
  outline: none;
`;

const SearchButton = styled(motion.button)`
  padding: 10px 20px;
  font-size: 1.5rem;
  margin-left: 20px;
  border: none;
  background-color: #28a745;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #218838;
  }
`;

const LoadingIndicator = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 20px;
  font-size: 1.5rem;
  color: #28a745;
`;

const SearchBar = ({ onSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      onSearch(searchTerm);
      setIsLoading(false);
      setIsOpen(false);
    //   setSearchTerm("");
    }
  };

  return (
    <SearchContainer>
      <SearchIcon
        onClick={() => setIsOpen(!isOpen)}
        initial={{ opacity: 0 }}
        // animate={{ opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={isOpen ? { scale: [1, 1.4, 1], opacity: 1 } : { scale: [1, 1.2, 1.2], opacity: 1 }}
        transition={{ 
          duration: 1.5,
          repeat: isOpen ? Infinity : 0,
          repeatType: "reverse",
        }}
      >
        🔍
      </SearchIcon>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "auto" }}
            exit={{ width: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center' }}>
              <SearchInput
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                initial={{ width: 0 }}
                animate={{ width: "300px" }}
                exit={{ width: 0 }}
                transition={{ duration: 0.3 }}
              />
              {isLoading ? (
                <LoadingIndicator
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  ⏳
                </LoadingIndicator>
              ) : (
                <SearchButton
                  type="submit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Buscar
                </SearchButton>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </SearchContainer>
  );
};

export default SearchBar;
