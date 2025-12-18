package cmd

import (
	"fmt"
	"log"
	"net/http"
	
	"backend/internal/handlers"
)

func main() {
	fmt.Println("started-service")

	// TODO: Initialize database connections here
	// InitPostgreSQLBackend()
	// InitGCSBackend()

	log.Fatal(http.ListenAndServe(":8080", handlers.InitRouter())) // Start HTTP server

}