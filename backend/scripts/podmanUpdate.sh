podman stop battleship-backend \
&& podman rm battleship-backend \
&& podman image rm battleship_backend_image \
&& podman build -t battleship_backend_image . \
&& podman run -d --name battleship-backend -e PORT=8080 -p 8080:8080 battleship_backend_image