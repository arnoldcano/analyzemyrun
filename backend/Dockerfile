FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the start script and make it executable
COPY start.sh .
RUN chmod +x start.sh

# Copy the rest of the application
COPY . .

# Set Python path
ENV PYTHONPATH=/app

# Start the application
CMD ["./start.sh"] 