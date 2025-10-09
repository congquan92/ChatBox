// const [msgs, setMsgs] = useState([]);
//     const [text, setText] = useState("");
//     const [typingUser, setTypingUser] = useState(null);

//     useEffect(() => {
//         socket.emit("room:join", ROOM_ID);

//         const onIncoming = (msg) => setMsgs((p) => [...p, msg]);
//         const onTyping = ({ user }) => {
//             setTypingUser(user);
//             setTimeout(() => setTypingUser(null), 800);
//         };

//         socket.on("room:message", onIncoming);
//         socket.on("room:typing", onTyping);

//         return () => {
//             socket.off("room:message", onIncoming);
//             socket.off("room:typing", onTyping);
//         };
//     }, []);

//     const send = async () => {
//         const clean = text.trim();
//         if (!clean) return;

//         // Gửi qua REST để lưu DB
//         await fetch(`${import.meta.env.VITE_API_URL}/messages`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             credentials: "include",
//             body: JSON.stringify({
//                 conversationId: ROOM_ID,
//                 senderId: 1, // set từ auth
//                 text: clean,
//             }),
//         });

//         setText("");
//     };

//     return (
//         <>
//             <div style={{ maxWidth: 720, margin: "20px auto" }}>
//                 <h1>Chat {ROOM_ID}</h1>

//                 <div style={{ height: 360, border: "1px solid #ddd", padding: 12, overflow: "auto", borderRadius: 8 }}>
//                     {msgs.map((m) => (
//                         <div key={m.id} style={{ marginBottom: 10 }}>
//                             <b>{m.senderId}:</b> {m.text}
//                         </div>
//                     ))}
//                 </div>

//                 <div style={{ height: 20, fontSize: 12, opacity: 0.7 }}>{typingUser ? `${typingUser} đang nhập...` : " "}</div>

//                 <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
//                     <input
//                         value={text}
//                         onChange={(e) => {
//                             setText(e.target.value);
//                             socket.emit("room:typing", { roomId: ROOM_ID, user: "Alex" });
//                         }}
//                         onKeyDown={(e) => e.key === "Enter" && send()}
//                         placeholder="Nhập tin nhắn…"
//                         style={{ flex: 1, padding: 10 }}
//                     />
//                     <button onClick={send}>Gửi</button>
//                 </div>
//             </div>
//         </>
//     );
