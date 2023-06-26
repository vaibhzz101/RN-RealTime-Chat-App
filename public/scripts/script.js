document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const loginError = document.getElementById('login-error');
  
    const signupForm = document.getElementById('signup-form');
    const signupUsernameInput = document.getElementById('signup-username');
    const signupEmailInput = document.getElementById('signup-email');
    const signupPasswordInput = document.getElementById('signup-password');
    const signupError = document.getElementById('signup-error');
  

    const baseURL = 'http://localhost:7070'; 
  
    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginEmailInput.value.trim();
      const password = loginPasswordInput.value.trim();
  
      try {
        const response = await fetch(`${baseURL}/user/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
  
        if (response.ok) {
          const data = await response.json();
          const token = data.Token;
          localStorage.setItem("token", token)
          alert("login success")
          window.location("./chat.html")
          console.log(token);
        } else {
          loginError.textContent = 'Invalid email or password';
        }
      } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = 'An error occurred during login';
      }
    });
  
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = signupUsernameInput.value.trim();
      const email = signupEmailInput.value.trim();
      const password = signupPasswordInput.value.trim();
  
      try {
        const response = await fetch(`${baseURL}/user/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, email, password })
        });
  
        if (response.ok) {
          const data = await response.json();
          alert("sign-up successfull !!")
          console.log(data);
        } else {
          const data = await response.json();
          signupError.textContent = data.err;
        }
      } catch (error) {
        console.error('Signup error:', error);
        signupError.textContent = 'An error occurred during signup';
      }
    });
  });
  