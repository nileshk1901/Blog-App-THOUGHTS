
import React, { useState } from "react";

const RegisterPage = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	async function register(ev) {
		ev.preventDefault();
		const response = await fetch(`${process.env.REACT_APP_API_URL}/register`, {
			method: "POST",
			body: JSON.stringify({ username, password }),
			headers: { "Content-Type": "application/json" },
		});
		if (response.ok) {
			alert("Registration successful");
		} else {
			alert("Registration failed");
		}
	}

	return (
		<form className="register" onSubmit={register}>
			<h1>Register</h1>
			<input
				type="text"
				placeholder="Username"
				value={username}
				onChange={(ev) => setUsername(ev.target.value)}
			/>
			<input
				type="password"
				placeholder="Password"
				value={password}
				onChange={(ev) => setPassword(ev.target.value)}
			/>
			<button>Register</button>
		</form>
	);
};

export default RegisterPage;
