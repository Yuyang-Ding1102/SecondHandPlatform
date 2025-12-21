import React, {useState} from "react";
import NavBarForLogin from "./NavBarForLogin";
import axios from "axios"
import { BASE_URL } from "../constants";

// api: POST /login
import{
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
} from "@mui/material";

function Login({handleLoggedIn}) {
    const [userName,setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const[error, setError] = useState("");

    const handleSubmit = async () => { // when user click submit button
        if (!userName || !password) {
            setError("Please enter a valid username and Password");
            return;
        }
        setLoading(true);
        setError(null);

        // classify request order
        try {
            const res = await axios.post(`${BASE_URL}/login`, {
                userName,
                password,
            });
            handleLoggedIn(res.data.token);
        } catch (err) {
            setError("Invalid username or password");

        }finally{
            setLoading(false);
        }
    };

  return(
      <>
    <NavBarForLogin/>
    <Box
        sx={{
            minHeight: "calc(80vh - 70px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            px: 3,
        }}
    >
        <Paper
            elevation={3}
            sx={{
                width: 560,
                p: 3,
                borderRadius: 2,
            }}
        >
            <Typography variant="h4" sx={{ marginBottom: 2, fontWeight: 600 }}>
                Login
            </Typography>

            {error && (
                <Alert severity="error" sx={{ marginBottom: 2 }}>
                    {error}x
                </Alert>
            )}

            <TextField
                label="Username"
                fullWidth
                margin="normal"
                value={userName}
                onChange={(e) => setUsername(e.target.value)}
            />

            <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <Box
                sx={{
                    display: "flex",
                    marginTop: 2,
                    gap: 2,
                }}
            >
                <Button
                    variant="outlined"
                    fullWidth
                    // onClick={() => navigate("/register")}
                >
                    Don't have account? Register
                </Button>

                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSubmit} //execute login
                    disabled={loading} //preventing for repeated submit
                >
                    {loading ? "Logging in..." : "Login"}
                </Button>
            </Box>
        </Paper>
    </Box>
      </>

  );
}

export default Login;
