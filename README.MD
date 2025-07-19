# Data Annotation Platform

## Development Setup

### Start the Web Application

```sh
yarn install
yarn dev
```

- This will start the frontend at [http://localhost:5173](http://localhost:5173).

### Start MONAI Label Server (Radiology App)

1. Download the radiology app:

    ```sh
    docker run -d --rm -v $(pwd)/apps:/workspace/apps projectmonai/monailabel:latest monailabel apps --download --name radiology --output /workspace/apps
    ```

2. Start the MONAI Label server:

    ```sh
    docker run --rm -p 8000:8000 -v $(pwd)/apps:/workspace/apps projectmonai/monailabel:latest monailabel start_server --app /workspace/apps/radiology --studies "dicomweb:http://35.223.3.190/" --conf models all
    ```

- The MONAI Label server will be available at [http://localhost:8000](http://localhost:8000).

### Notes

- Ignore any `apps` directory or files in the repository; always use the above Docker commands to manage MONAI apps.
- The web and MONAI server run independently.