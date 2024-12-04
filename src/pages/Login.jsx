import { TextInput, Button, Paper, Text, Box, Alert } from '@mantine/core';
import { useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { IconAlertCircle } from '@tabler/icons-react';
import LoginImage from '../assets/images/archipilot-login.svg';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const hasError = Boolean(error);

  return (
    <Box
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'white'
      }}
    >
      {/* Left section */}
      <Paper
        style={{
          width: '50%',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
        radius={0}
        shadow={0}
      >
        <Box style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
          <Text
            size="xl"
            fw={700}
            mb={30}
            className='bold-title'
          >
            CONNEXION
          </Text>
          <Text
            size="sm"
            c="dimmed"
            mb={30}
          >
            Découvrez comment faciliter la gestion de vos projets de construction.
          </Text>
          <form onSubmit={handleSubmit}>
            <TextInput
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              size="md"
              radius="md"
              mb="md"
              error={hasError}
              disabled={isLoading}
              leftSection={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="7" r="4" />
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                </svg>
              }
            />
            <TextInput
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="md"
              radius="md"
              mb="xl"
              error={hasError}
              disabled={isLoading}
              leftSection={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              }
            />
            <Button
              fullWidth
              size="md"
              radius="md"
              type="submit"
              loading={isLoading}
              style={{ backgroundColor: '#7950F2' }}
            >
              Se connecter
            </Button>

            {error && (
              <Alert
                icon={<IconAlertCircle size="1rem" />}
                title="Erreur de connexion"
                color="red"
                variant="light"
                mt="md"
              >
                {error}
              </Alert>
            )}
          </form>
        </Box>
      </Paper>
      {/* Right section with image */}
      <Box
        style={{
          width: '50%',
          backgroundColor: '#7950F2',
          display: 'flex'
        }}
      >
        <img
          src={LoginImage}
          alt="Illustration de connexion"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </Box>
    </Box>
  );
}