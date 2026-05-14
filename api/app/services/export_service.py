import json
import csv
import os
from datetime import datetime
from typing import Dict, Any, Optional
import sqlite3

from ..models import ExportRequest

class ExportService:
    """导出服务 - 支持 Obsidian 格式导出"""
    
    def __init__(self):
        self.default_vault_path = os.path.expanduser(
            "~/Library/Mobile Documents/iCloud~md~obsidian/Documents/karpathy-llm-wiki"
        )
    
    async def export_to_obsidian(self, request: ExportRequest) -> str:
        """导出数据到 Obsidian"""
        vault_path = request.obsidian_vault_path or self.default_vault_path
        
        if not os.path.exists(vault_path):
            raise ValueError(f"Obsidian vault 路径不存在: {vault_path}")
        
        # 创建导出目录
        export_dir = os.path.join(vault_path, "Raw-Sources", "Harness-Dashboard")
        os.makedirs(export_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        if request.export_type == "markdown":
            return await self._export_markdown(request, export_dir, timestamp)
        elif request.export_type == "json":
            return await self._export_json(request, export_dir, timestamp)
        elif request.export_type == "csv":
            return await self._export_csv(request, export_dir, timestamp)
        else:
            raise ValueError(f"不支持的导出类型: {request.export_type}")
    
    async def _export_markdown(self, request: ExportRequest, export_dir: str, timestamp: str) -> str:
        """导出为 Markdown 格式"""
        filename = f"harness-report-{timestamp}.md"
        filepath = os.path.join(export_dir, filename)
        
        content = f"""# Harness Engineering 报告

> 生成时间: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
> 数据类型: {request.data_type}

## 系统概览

```yaml
状态: 运行中
版本: 1.0.0
```

## 模型状态

| 模型 | 提供商 | 状态 | 调用次数 |
|:---|:---|:---|---:|
| kimi-k2.6 | kimi-coding | ✅ 活跃 | 0 |
| qwen-turbo | dashscope | ✅ 正常 | 0 |

## TaskFlow 状态

| 工作流 | 类型 | 状态 | 进度 |
|:---|:---|:---|---:|
| new-module | 新模块 | ⏳ 待执行 | 0% |
| auth-module | 认证模块 | ⏳ 待执行 | 0% |
| hotfix | 热修复 | ⏳ 待执行 | 0% |
| refactor | 重构 | ⏳ 待执行 | 0% |

## 执行历史

> 最近 50 条执行记录

## 成本分析

> 最近 7 天成本统计

---

*由 Harness Dashboard 自动生成*
"""
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        
        return filepath
    
    async def _export_json(self, request: ExportRequest, export_dir: str, timestamp: str) -> str:
        """导出为 JSON 格式"""
        filename = f"harness-data-{timestamp}.json"
        filepath = os.path.join(export_dir, filename)
        
        data = {
            "export_time": datetime.now().isoformat(),
            "data_type": request.data_type,
            "system": {
                "status": "running",
                "version": "1.0.0"
            },
            "models": [],
            "taskflows": [],
            "executions": []
        }
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        return filepath
    
    async def _export_csv(self, request: ExportRequest, export_dir: str, timestamp: str) -> str:
        """导出为 CSV 格式"""
        filename = f"harness-data-{timestamp}.csv"
        filepath = os.path.join(export_dir, filename)
        
        with open(filepath, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["时间", "类型", "状态", "描述"])
            writer.writerow([datetime.now().isoformat(), "system", "running", "系统正常运行"])
        
        return filepath
