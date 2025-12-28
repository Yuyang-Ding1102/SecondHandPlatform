package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"backend/internal/database"
	"backend/internal/service"
	"backend/pkg/utils"
)

// uploadNewPostHandler 上传新商品（包含图片）
// POST /upload
func uploadNewPostHandler(w http.ResponseWriter, r *http.Request) {
	// 1. 从 Context 中获取用户ID
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.SendErrorResponse(w, http.StatusUnauthorized, "User not authenticated")
		return
	}

	// 2. 解析 multipart form（限制 10MB）
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Failed to parse form: "+err.Error())
		return
	}

	// 3. 获取表单字段
	title := r.FormValue("title")
	description := r.FormValue("description")
	priceStr := r.FormValue("price")
	contactInfo := r.FormValue("contact_info")
	zipCode := r.FormValue("zip_code")
	negotiableStr := r.FormValue("negotiable")

	// 4. 验证必填字段
	if title == "" || priceStr == "" || contactInfo == "" || zipCode == "" {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Missing required fields")
		return
	}

	// 5. 转换 price
	price, err := strconv.ParseFloat(priceStr, 64)
	if err != nil || price <= 0 {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Invalid price")
		return
	}

	// 6. 转换 negotiable（默认 false）
	negotiable := false
	if negotiableStr == "true" || negotiableStr == "1" {
		negotiable = true
	}

	// 7. 获取上传的图片文件
	files := r.MultipartForm.File["images"]
	if len(files) == 0 {
		utils.SendErrorResponse(w, http.StatusBadRequest, "At least one image is required")
		return
	}

	if len(files) > 5 {
		utils.SendErrorResponse(w, http.StatusBadRequest, "Maximum 5 images allowed")
		return
	}

	// 8. 上传图片到 GCS
	var imageURLs []string
	for _, fileHeader := range files {
		// 验证文件类型
		contentType := fileHeader.Header.Get("Content-Type")
		if !strings.HasPrefix(contentType, "image/") {
			utils.SendErrorResponse(w, http.StatusBadRequest, "Only image files are allowed")
			return
		}

		// 打开文件
		file, err := fileHeader.Open()
		if err != nil {
			utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to open file")
			return
		}
		defer file.Close()

		// 上传到 GCS
		url, err := database.UploadFile(file, fileHeader)
		if err != nil {
			utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to upload image: "+err.Error())
			return
		}

		imageURLs = append(imageURLs, url)
	}

	// 9. 创建商品
	post, err := service.CreatePost(service.CreatePostRequest{
		UserID:      userID,
		Title:       title,
		Description: description,
		Price:       price,
		ContactInfo: contactInfo,
		ZipCode:     zipCode,
		Negotiable:  negotiable,
		ImageURLs:   imageURLs,
	})
	if err != nil {
		utils.SendErrorResponse(w, http.StatusInternalServerError, "Failed to create post: "+err.Error())
		return
	}

	// 10. 返回成功响应
	utils.SendSuccessWithMessage(w, "Post created successfully", post)
}
