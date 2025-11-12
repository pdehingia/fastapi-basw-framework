# Maya Platform Docker Deployment Script for Windows PowerShell
# This script helps deploy the complete Maya Platform using Docker Compose.

# Maya Platform Docker Deployment Script for Windows PowerShell
# This script helps deploy the complete Maya Platform using Docker Compose.

function Write-Banner {
    Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║                      MAYA PLATFORM                          ║
║                   Docker Deployment                         ║
║                                                              ║
║  🐳 Complete Containerized Setup                            ║
║  📊 PostgreSQL (port 5443) + MongoDB + Redis               ║
║  🚀 FastAPI Backend with Auto-Migrations                    ║
╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan
}

function Test-Docker {
    Write-Host "Checking Docker installation..." -ForegroundColor Yellow
    
    try {
        $dockerVersion = docker --version
        Write-Host "✅ $dockerVersion" -ForegroundColor Green
        
        $composeVersion = docker compose version
        Write-Host "✅ $composeVersion" -ForegroundColor Green
        
        return $true
    }
    catch {
        Write-Host "❌ Docker is not installed or not running" -ForegroundColor Red
        Write-Host "Please install Docker Desktop and ensure it's running" -ForegroundColor Red
        return $false
    }
}

function Stop-ExistingContainers {
    Write-Host "Stopping existing containers..." -ForegroundColor Yellow
    
    $containers = @("maya_postgres", "maya_mongodb", "maya_redis", 
                   "maya_backend", "maya_pgadmin", "maya_mongo_express")
    
    foreach ($container in $containers) {
        try {
            docker stop $container 2>$null
            docker rm $container 2>$null
        }
        catch {
            # Ignore errors for non-existent containers
        }
    }
}

function Build-AndStartServices {
    Write-Host "Building and starting services..." -ForegroundColor Yellow
    
    try {
        Write-Host "   Building Docker images..." -ForegroundColor White
        docker compose build --no-cache
        
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to build images"
        }
        
        Write-Host "   Starting all services..." -ForegroundColor White
        docker compose up -d
        
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to start services"
        }
        
        return $true
    }
    catch {
        Write-Host "❌ Failed to build/start services: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Wait-ForServices {
    Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
    
    $services = @(
        @{Container="maya_postgres"; Name="PostgreSQL"},
        @{Container="maya_mongodb"; Name="MongoDB"}, 
        @{Container="maya_redis"; Name="Redis"},
        @{Container="maya_backend"; Name="FastAPI Backend"}
    )
    
    $maxWait = 300  # 5 minutes
    $waitInterval = 10
    
    foreach ($service in $services) {
        $elapsed = 0
        Write-Host "   Waiting for $($service.Name)..." -ForegroundColor White
        
        while ($elapsed -lt $maxWait) {
            try {
                $healthStatus = docker inspect --format='{{.State.Health.Status}}' $service.Container 2>$null
                
                if ($healthStatus -eq "healthy") {
                    Write-Host "   ✅ $($service.Name) is ready!" -ForegroundColor Green
                    break
                }
                elseif ($healthStatus -eq "unhealthy") {
                    Write-Host "   ❌ $($service.Name) is unhealthy!" -ForegroundColor Red
                    return $false
                }
            }
            catch {
                # Health check might not be available yet
            }
            
            Start-Sleep $waitInterval
            $elapsed += $waitInterval
            Write-Host "   $($service.Name) still starting... ($elapsed s/$maxWait s)" -ForegroundColor Gray
        }
        
        if ($elapsed -ge $maxWait) {
            Write-Host "   ❌ Timeout waiting for $($service.Name)" -ForegroundColor Red
            return $false
        }
    }
    
    return $true
}

function Show-ServiceStatus {
    Write-Host "`nService Status:" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Gray
    
    try {
        docker compose ps
    }
    catch {
        Write-Host "❌ Failed to get service status" -ForegroundColor Red
    }
}

function Show-AccessInfo {
    Write-Host "`n🌐 Access Information:" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Gray
    Write-Host "🚀 FastAPI Backend:" -ForegroundColor Green
    Write-Host "   • API: http://localhost:8000" -ForegroundColor White
    Write-Host "   • Docs: http://localhost:8000/docs" -ForegroundColor White
    Write-Host "   • Health: http://localhost:8000/api/v1/health" -ForegroundColor White
    Write-Host ""
    Write-Host "🗄️ Database Admin:" -ForegroundColor Green
    Write-Host "   • pgAdmin: http://localhost:5050" -ForegroundColor White
    Write-Host "     Email: admin@maya.com" -ForegroundColor Gray
    Write-Host "     Password: maya_pgadmin_password_2024" -ForegroundColor Gray
    Write-Host "   • MongoDB Express: http://localhost:8081" -ForegroundColor White
    Write-Host "     Username: maya_admin" -ForegroundColor Gray
    Write-Host "     Password: maya_express_password_2024" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📊 Direct Database Connections:" -ForegroundColor Green
    Write-Host "   • PostgreSQL: localhost:5443" -ForegroundColor White
    Write-Host "     Username: postgres" -ForegroundColor Gray
    Write-Host "     Password: maya_secure_password_2024" -ForegroundColor Gray
    Write-Host "     Database: maya_platform" -ForegroundColor Gray
    Write-Host "   • MongoDB: localhost:27017" -ForegroundColor White
    Write-Host "     Username: maya_admin" -ForegroundColor Gray
    Write-Host "     Password: maya_mongo_password_2024" -ForegroundColor Gray
    Write-Host "   • Redis: localhost:6379" -ForegroundColor White
    Write-Host "     Password: maya_redis_password_2024" -ForegroundColor Gray
}

function Show-RecentLogs {
    Write-Host "`n📝 Recent Logs:" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Gray
    docker compose logs --tail=20
}

# Main deployment function
function Deploy-MayaPlatform {
    Write-Banner
    
    # Check Docker
    if (-not (Test-Docker)) {
        exit 1
    }
    
    # Stop existing containers
    Stop-ExistingContainers
    
    # Build and start
    if (-not (Build-AndStartServices)) {
        Write-Host "`n❌ Deployment failed during build/start phase" -ForegroundColor Red
        Show-RecentLogs
        exit 1
    }
    
    # Wait for services
    if (-not (Wait-ForServices)) {
        Write-Host "`n❌ Deployment failed - services not healthy" -ForegroundColor Red
        Show-RecentLogs
        exit 1
    }
    
    # Show status and access info
    Show-ServiceStatus
    Show-AccessInfo
    
    Write-Host "`n🎉 MAYA PLATFORM DEPLOYMENT COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                    DEPLOYMENT SUMMARY                       ║" -ForegroundColor Cyan
    Write-Host "║                                                              ║" -ForegroundColor Cyan
    Write-Host "║  ✅ PostgreSQL: Running on port 5443                        ║" -ForegroundColor Cyan
    Write-Host "║  ✅ MongoDB: Running with collections                       ║" -ForegroundColor Cyan
    Write-Host "║  ✅ Redis: Cache service ready                              ║" -ForegroundColor Cyan
    Write-Host "║  ✅ FastAPI: Backend with auto-migrations                   ║" -ForegroundColor Cyan
    Write-Host "║  ✅ Admin Tools: pgAdmin & MongoDB Express                  ║" -ForegroundColor Cyan
    Write-Host "║                                                              ║" -ForegroundColor Cyan
    Write-Host "║  🚀 Your Maya Platform is ready for use!                    ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "• Visit http://localhost:8000/docs to explore the API" -ForegroundColor White
    Write-Host "• Use the admin tools to manage your databases" -ForegroundColor White
    Write-Host "• Check logs with: docker compose logs -f" -ForegroundColor White
    Write-Host "• Stop services with: docker compose down" -ForegroundColor White
}

# Run the deployment
try {
    Deploy-MayaPlatform
}
catch {
    Write-Host "`n❌ Deployment failed with error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}