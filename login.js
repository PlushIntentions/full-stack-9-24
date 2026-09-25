body {
  margin: 0;
  background: #1E1E1E; /* charcoal */
  font-family: 'Inter', sans-serif;
}

.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  background: #2A2A2A; /* deep graphite */
  padding: 40px;
  width: 420px;
  border-radius: 14px;
  border: 1px solid #C9C9C9; /* silver */
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  text-align: center;
}

.logo {
  width: 140px;
  margin-bottom: 20px;
}

.title {
  color: #FFFFFF;
  font-size: 20px;
  margin-bottom: 20px;
}

.role-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 25px;
}

.role-btn {
  background: #D2C8BD; /* earthy taupe */
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 15px;
  color: #1E1E1E;
  cursor: pointer;
  transition: 0.2s;
}

.role-btn:hover {
  background: #C7BEB4;
}

.field {
  text-align: left;
  margin-bottom: 18px;
}

.field label {
  color: #FFFFFF;
  font-size: 14px;
}

.field input {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #C9C9C9;
  background: #1E1E1E;
  color: #FFFFFF;
  font-size: 15px;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: #4A6C82; /* steel blue tech accent */
  border: none;
  border-radius: 8px;
  font-size: 16px;
  color: #FFFFFF;
  cursor: pointer;
  transition: 0.2s;
}

.login-btn:hover {
  background: #3E5A6D;
}

.error {
  color: #FF6B6B;
  margin-top: 10px;
}
