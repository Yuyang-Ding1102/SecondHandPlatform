import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Pagination,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Added for navigation
import { BASE_URL, TOKEN_KEY } from "../constants";

import NavBar from "./NavBarNew";

function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Initialize navigation hook
  const navigate = useNavigate();

  // State for edit modal
  const [openEdit, setOpenEdit] = useState(false);
  const [editingItem, setEditingItem] = useState({
    id: "",
    title: "",
    price: "",
    description: "",
  });

  const token = localStorage.getItem(TOKEN_KEY);

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        setLoading(true);
        setError("");

        // Optional: Toggle this block to test UI without a working backend
        /*
        const mockData = [
          { 
            id: 1, 
            title: "Vintage Film Camera", 
            price: 150, 
            description: "A well-maintained classic camera.",
            image_urls: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500"] 
          },
          { 
            id: 2, 
            title: "CS Textbook", 
            price: 45, 
            description: "Essential for your intro classes.",
            image_urls: ["https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500"] 
          }
        ];
        setListings(mockData);
        setLoading(false);
        return; 
        */

        // Real API request to fetch user-specific listings with pagination
        const response = await axios.get(`${BASE_URL}/mylistings`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: currentPage,
            page_size: 6, // 每页6个商品
          },
        });

        // 后端返回格式: { success: true, data: { posts: [...], total_count, page, page_size, total_pages } }
        if (response.data.success) {
          const { posts, total_count, total_pages } = response.data.data;
          setListings(posts || []);
          setTotalCount(total_count || 0);
          setTotalPages(total_pages || 0);
        } else {
          setError("Failed to load listings");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to connect to server. Ensure backend is running.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMyListings();
    } else {
      setError("No token found. Please log in first.");
      setLoading(false);
    }
  }, [token, currentPage]);

  // Handle item deletion from both UI and Database
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      // Optimistic UI update: remove item from state immediately
      const updatedListings = listings.filter((item) => item.id !== id);
      setListings(updatedListings);

      try {
        await axios.delete(`${BASE_URL}/item/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error("Delete failed on server:", err);
        alert("Server error: Could not delete item.");
        // Re-fetch or revert state if necessary
      }
    }
  };

  // Open the edit modal and populate with current item data
  const handleOpenEdit = (item) => {
    setEditingItem({ ...item });
    setOpenEdit(true);
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle the update submission
  const handleUpdate = async () => {
    try {
      // 后端只允许修改title, price, description
      const updateData = {
        title: editingItem.title,
        price: parseFloat(editingItem.price), // 确保price是数字
        description: editingItem.description,
      };

      console.log("Updating item:", editingItem.id, "with data:", updateData);
      console.log("Token:", token);

      // API call to update item: PUT /item/{id} (RESTful)
      const response = await axios.put(
        `${BASE_URL}/item/${editingItem.id}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Update response:", response.data);

      // 后端返回格式: { success: true, message: "...", data: {...} }
      if (response.data.success) {
        // Update local state to reflect changes
        setListings(
          listings.map((item) =>
            item.id === editingItem.id ? { ...item, ...updateData } : item
          )
        );

        setOpenEdit(false);
        alert("Listing updated successfully!");
      } else {
        alert(
          "Failed to update listing: " +
            (response.data.message || response.data.error)
        );
      }
    } catch (err) {
      console.error("Update failed:", err);
      console.error("Error response:", err.response);
      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to update item on server."
      );
    }
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );

  return (
    <>
      <NavBar />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100vh - 64px)", // 减去NavBar高度
        }}
      >
        <Container
          sx={{ flex: 1, display: "flex", flexDirection: "column", py: 3 }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              My Listings
            </Typography>
            <Button
              variant="contained"
              sx={{
                bgcolor: "#FFDA00",
                color: "#000",
                borderRadius: "20px",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#e6c500" },
              }}
              onClick={() => navigate("/upload")} // Navigates to the Upload page
            >
              + Post New Item
            </Button>
          </Box>

          {error && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {listings.length === 0 ? (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="body1" color="text.secondary">
                You haven't posted any items yet.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3} sx={{ flex: 1 }}>
              {listings.map((item) => (
                <Grid item key={item.id} xs={4}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: 2,
                      width: "100%", // 占满Grid item
                      height: 340, // 固定高度
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardMedia
                      component="img"
                      sx={{
                        width: "100%",
                        height: 200,
                        objectFit: "cover", // 确保图片按比例裁剪，不会变形
                      }}
                      image={
                        item.image_urls && item.image_urls.length > 0
                          ? item.image_urls[0]
                          : "https://via.placeholder.com/400x300"
                      }
                      alt={item.title}
                    />
                    <CardContent sx={{ flexGrow: 1, py: 1.5, px: 2 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                        noWrap
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="h6"
                        color="error"
                        sx={{ fontWeight: "bold" }}
                      >
                        ${item.price}
                      </Typography>
                    </CardContent>
                    <CardActions
                      sx={{
                        justifyContent: "flex-end",
                        px: 2,
                        py: 1,
                        borderTop: "1px solid #eee",
                      }}
                    >
                      <IconButton
                        onClick={() => handleOpenEdit(item)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(item.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>

        {/* Pagination Component - 固定在底部 */}
        <Box
          sx={{
            py: 3,
            borderTop: "1px solid #eee",
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        </Box>
      </Box>

      {/* Modal for editing item details */}
      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Edit Listing</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Title"
            margin="normal"
            value={editingItem.title}
            onChange={(e) =>
              setEditingItem({ ...editingItem, title: e.target.value })
            }
          />
          <TextField
            fullWidth
            label="Price ($)"
            margin="normal"
            type="number"
            value={editingItem.price}
            onChange={(e) =>
              setEditingItem({ ...editingItem, price: e.target.value })
            }
          />
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            multiline
            rows={3}
            value={editingItem.description || ""}
            onChange={(e) =>
              setEditingItem({ ...editingItem, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenEdit(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            variant="contained"
            sx={{
              bgcolor: "#FFDA00",
              color: "#000",
              fontWeight: "bold",
              borderRadius: "20px",
              "&:hover": { bgcolor: "#e6c500" },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default MyListings;
