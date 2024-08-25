import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../UserContext";

const Header = () => {
	const { setUserInfo, userInfo } = useContext(UserContext);

	useEffect(() => {
		fetch(`${process.env.REACT_APP_API_URL}/profile`, {
			credentials: "include",
		})
			.then((response) => response.json())
			.then((userInfo) => {
				setUserInfo(userInfo);
			})
			.catch((error) => console.error("Error fetching profile:", error));
	}, [setUserInfo]);

	const logout = () => {
		fetch(`${process.env.REACT_APP_API_URL}/logout`, {
			credentials: "include",
			method: "POST",
		})
			.then(() => setUserInfo(null))
			.catch((error) => console.error("Error logging out:", error));
	};

	const username = userInfo?.username;

	return (
		<header style={styles.header}>
			<Link to="/" className="logo" style={styles.logo}>
				Thoughts
			</Link>
			<nav>
				{username ? (
					<>
						<Link to="/create" style={styles.navLink}>
							Express Yourself
						</Link>

						<a onClick={logout} style={styles.navLink}>
							Logout
						</a>
					</>
				) : (
					<>
						<Link to="/login" style={styles.navLink}>
							Login
						</Link>
						<Link to="/register" style={styles.navLink}>
							Register
						</Link>
					</>
				)}
			</nav>
		</header>
	);
};

const styles = {
	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "#282c34",
		padding: "10px 20px",
		color: "white",
	},
	logo: {
		fontSize: "24px",
		fontWeight: "bold",
		color: "#61dafb",
		textDecoration: "none",
	},
	navLink: {
		marginLeft: "15px",
		padding: "8px 16px",
		borderRadius: "4px",
		backgroundColor: "#61dafb",
		color: "#282c34",
		textDecoration: "none",
		transition: "background-color 0.3s ease",
		cursor: "pointer",
	},
	navLinkHover: {
		backgroundColor: "#21a1f1",
	},
	icon: {
		marginLeft: "15px",
		width: "24px",
		height: "24px",
		color: "#61dafb",
		cursor: "pointer",
	},
};

export default Header;
