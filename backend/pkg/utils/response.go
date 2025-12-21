package utils

import (
	"encoding/json"
	"net/http"
)

// Response 统一响应结构
type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

// SendSuccessResponse 发送成功响应
func SendSuccessResponse(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json") // 设置响应头：告诉浏览器"我要返回 JSON 格式的数据"
	w.WriteHeader(http.StatusOK) // 设置响应状态码为 200 OK
	json.NewEncoder(w).Encode(Response{ // 构造并发送 JSON 响应：
		Success: true,
		Data:    data,
	})
}

// SendSuccessWithMessage 发送成功响应（带消息）
func SendSuccessWithMessage(w http.ResponseWriter, message string, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(Response{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// SendErrorResponse 发送错误响应
func SendErrorResponse(w http.ResponseWriter, statusCode int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(Response{
		Success: false,
		Message: message,
	})
}
