package database

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"path/filepath"
	"time"

	"backend/internal/config"

	"cloud.google.com/go/storage"
	"google.golang.org/api/option"
)

var gcsClient *storage.Client

// InitGCS 初始化 Google Cloud Storage 客户端
func InitGCS() error {
	ctx := context.Background()

	// 使用服务账号 JSON 文件创建客户端
	client, err := storage.NewClient(ctx, option.WithCredentialsFile(config.AppConfig.GoogleCredentialsPath))
	if err != nil {
		return fmt.Errorf("failed to create GCS client: %w", err)
	}

	gcsClient = client
	return nil
}

// UploadFile 上传文件到 GCS
func UploadFile(file multipart.File, fileHeader *multipart.FileHeader) (string, error) {
	ctx := context.Background()

	// 1. 生成唯一的文件名（使用时间戳 + 原文件名）
	timestamp := time.Now().Unix()
	ext := filepath.Ext(fileHeader.Filename)
	filename := fmt.Sprintf("%d_%s%s", timestamp, "image", ext)

	// 2. 获取 bucket
	bucket := gcsClient.Bucket(config.AppConfig.GCSBucket)

	// 3. 创建文件对象
	obj := bucket.Object(filename)
	writer := obj.NewWriter(ctx)

	// 4. 设置文件元数据
	writer.ContentType = fileHeader.Header.Get("Content-Type")

	// 5. 复制文件内容到 GCS
	if _, err := io.Copy(writer, file); err != nil {
		writer.Close()
		return "", fmt.Errorf("failed to upload file: %w", err)
	}

	// 6. 关闭 writer
	if err := writer.Close(); err != nil {
		return "", fmt.Errorf("failed to close writer: %w", err)
	}

	// 7. 返回文件的公开 URL
	// 格式：https://storage.googleapis.com/bucket-name/filename
	url := fmt.Sprintf("https://storage.googleapis.com/%s/%s", config.AppConfig.GCSBucket, filename)
	return url, nil
}

// DeleteFile 从 GCS 删除文件
func DeleteFile(filename string) error {
	ctx := context.Background()

	bucket := gcsClient.Bucket(config.AppConfig.GCSBucket)
	obj := bucket.Object(filename)

	if err := obj.Delete(ctx); err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}

	return nil
}
