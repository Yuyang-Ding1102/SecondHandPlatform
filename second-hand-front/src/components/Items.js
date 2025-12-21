import React from "react";
// import axios from "axios"
// import { BASE_URL } from "../constants";
// api: GET /items
import NavBar from "./NavBar";

import{
    Box,
    Grid,
    Typography,
    Pagination
} from "@mui/material"


const mockItems = [
    {id: 1},
    {id: 2},
    {id: 3},
    {id: 4},
    {id: 5},
    {id: 6},
    {id: 7},
    {id: 8},
];

function Items(props) {

    return(
        <>
        <NavBar/>
        <Box
         sx={{

             mx:"auto",
             mt: 3,
             maxWidth: 1200,
         }}
        >
            <Grid container spacing={6} justifyContent="center">
                {mockItems.map((item) => (
                    <Grid item xs={12} sm={6} md={3} key={item.id}>
                    {/*Item* card Placeholder*/}
                    <Box
                        sx={{
                            bgcolor: "#eee",
                            borderRadius: 2,
                            p:2,
                    }}
                    >
                    {/*image card placeholder*/}
                        <Box
                            sx={{
                            height: 160,
                            width: 200,
                            bgcolor: "#ccc",
                            mb:1.5,
                            }}
                        />
                    {/* text placeholder */}
                    <Typography variant="body2" fontWeight={600}>
                        xxxx &nbsp;&nbsp;&nbsp; xxxx
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                            xxxxxxxxxxxxxxxxxxxxxxxxx
                    </Typography>

                    </Box>

                    </Grid>
                ))}
            </Grid>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                <Pagination count={10} />
            </Box>
        </Box>
        </>
    );

}

export default Items;
