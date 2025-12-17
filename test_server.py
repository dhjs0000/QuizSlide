import http.server
import socketserver
import os

# 切换到项目目录
os.chdir('e:/文档/bbyc/QuizSlide')

# 创建简单的HTTP请求处理器
handler = http.server.SimpleHTTPRequestHandler

# 启动服务器
with socketserver.TCPServer(('', 8080), handler) as httpd:
    print('服务器运行在 http://localhost:8080/')
    print('按 Ctrl+C 停止服务器')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n服务器已停止')