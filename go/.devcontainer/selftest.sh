#!/bin/sh -ex
go version
cat >/tmp/helloworld.go <<EOF
package main
import "fmt"
func main() { fmt.Println("Hello World!") }
EOF
go fmt /tmp/helloworld.go
cat /tmp/helloworld.go
go run /tmp/helloworld.go
