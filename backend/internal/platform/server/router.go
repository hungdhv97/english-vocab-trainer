package server

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/level"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/play"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/user"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/modules/word"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/deps"
	"github.com/hungdhv97/english-vocab-trainer/backend/internal/platform/middleware"
)

// NewRouter creates a Gin engine with all routes registered.
func NewRouter(d *deps.Deps) *gin.Engine {
	r := gin.New()
	r.Use(middleware.Recovery(), middleware.Logger(d.Log), middleware.RequestID(), middleware.CORS(), middleware.Gzip())

	api := r.Group("/api/v1")
	user.RegisterRoutes(api, d)
	word.RegisterRoutes(api, d)
	level.RegisterRoutes(api, d)
	play.RegisterRoutes(api, d)

	r.GET("/openapi.yaml", func(c *gin.Context) { c.File("docs/openapi.yaml") })
	r.GET("/docs", func(c *gin.Context) {
		html := `<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: '/openapi.yaml',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis],
          requestInterceptor: (req) => {
            req.credentials = 'include';
            return req;
          },
        });
      };
    </script>
  </body>
</html>`
		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(html))
	})

	return r
}
