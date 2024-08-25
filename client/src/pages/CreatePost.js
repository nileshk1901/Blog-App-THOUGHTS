import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Editor from "../Editor";
import { Navigate } from "react-router-dom";

const CreatePost = () => {
	const [title, setTitle] = useState("");
	const [summary, setSummary] = useState("");
	const [content, setContent] = useState("");
	const [files, setFiles] = useState("");
	const [redirect, setRedirect] = useState(false);

	async function createNewPost(ev) {
		ev.preventDefault();
		const data = new FormData();
		data.set("title", title);
		data.set("summary", summary);
		data.set("content", content);
		data.set("file", files[0]);

		const response = await fetch(`${process.env.REACT_APP_API_URL}/post`, {
			method: "POST",
			body: data,
			credentials: "include",
		});

		if (response.ok) {
			setRedirect(true);
		}
	}

	if (redirect) {
		return <Navigate to={"/"} />;
	}

	return (
		<form onSubmit={createNewPost}>
			<input
				type="text"
				placeholder={"Title"}
				value={title}
				onChange={(ev) => setTitle(ev.target.value)}
			/>
			<input
				type="text"
				placeholder={"Summary"}
				value={summary}
				onChange={(ev) => setSummary(ev.target.value)}
			/>
			<input type="file" onChange={(ev) => setFiles(ev.target.files)} />
			<Editor value={content} onChange={setContent} />
			<button style={{ marginTop: "5px" }}>Create post</button>
		</form>
	);
};

export default CreatePost;
