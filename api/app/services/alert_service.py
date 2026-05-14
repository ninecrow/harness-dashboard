import json
import os
from datetime import datetime
from typing import List, Dict, Optional, Any
import httpx

from ..models import AlertConfig, AlertSeverity

class AlertService:
    """告警服务 - 飞书通知集成"""
    
    def __init__(self):
        self.config: Optional[AlertConfig] = None
        self.history: List[Dict[str, Any]] = []
        self._load_config()
    
    def _load_config(self):
        """加载告警配置"""
        config_path = os.path.expanduser("~/.hermes/alerts/config.json")
        if os.path.exists(config_path):
            try:
                with open(config_path, "r") as f:
                    data = json.load(f)
                    self.config = AlertConfig(**data)
            except Exception:
                self.config = AlertConfig()
        else:
            self.config = AlertConfig()
    
    async def update_config(self, config: AlertConfig):
        """更新告警配置"""
        self.config = config
        
        # 保存到文件
        config_path = os.path.expanduser("~/.hermes/alerts")
        os.makedirs(config_path, exist_ok=True)
        
        with open(os.path.join(config_path, "config.json"), "w") as f:
            json.dump(config.dict(), f, indent=2)
    
    async def send_alert(self, message: str, severity: AlertSeverity = AlertSeverity.WARNING):
        """发送告警"""
        if not self.config or not self.config.enabled:
            return
        
        alert = {
            "id": f"alert-{datetime.now().timestamp()}",
            "message": message,
            "severity": severity.value,
            "timestamp": datetime.now().isoformat(),
            "acknowledged": False
        }
        
        self.history.append(alert)
        
        # 发送飞书通知
        if self.config.feishu_webhook:
            await self._send_feishu(message, severity)
    
    async def _send_feishu(self, message: str, severity: AlertSeverity):
        """发送飞书消息"""
        try:
            # 从环境变量获取飞书配置
            app_id = os.environ.get("FEISHU_APP_ID", "cli_a96a143ae3385bcb")
            app_secret = os.environ.get("FEISHU_APP_SECRET", "")
            user_id = "ou_5e0e939da34eab050eb37f4c91ea7155"
            
            if not app_secret:
                return
            
            async with httpx.AsyncClient() as client:
                # 获取 token
                token_response = await client.post(
                    "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
                    json={"app_id": app_id, "app_secret": app_secret}
                )
                
                token_data = token_response.json()
                tenant_access_token = token_data.get("tenant_access_token")
                
                if not tenant_access_token:
                    return
                
                # 构建消息
                emoji = {"info": "ℹ️", "warning": "⚠️", "error": "❌", "critical": "🚨"}
                
                message_content = {
                    "text": f"{emoji.get(severity.value, '⚠️')} Harness Dashboard 告警\n\n{message}\n\n时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
                }
                
                # 发送消息
                await client.post(
                    "https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=open_id",
                    headers={"Authorization": f"Bearer {tenant_access_token}"},
                    json={
                        "receive_id": user_id,
                        "msg_type": "text",
                        "content": json.dumps(message_content)
                    }
                )
        
        except Exception as e:
            print(f"飞书通知发送失败: {e}")
    
    async def get_history(self, limit: int = 50, severity: Optional[str] = None) -> List[Dict[str, Any]]:
        """获取告警历史"""
        filtered = self.history
        
        if severity:
            filtered = [a for a in filtered if a["severity"] == severity]
        
        return filtered[-limit:]
    
    async def check_thresholds(self, metrics: Dict[str, Any]):
        """检查阈值并触发告警"""
        if not self.config or not self.config.enabled:
            return
        
        thresholds = self.config.thresholds
        
        # 检查错误率
        error_rate = metrics.get("error_rate", 0)
        if error_rate > thresholds.get("error_rate", 0.1):
            await self.send_alert(
                f"错误率超过阈值: {error_rate:.2%} (阈值: {thresholds['error_rate']:.2%})",
                AlertSeverity.ERROR
            )
        
        # 检查响应时间
        response_time = metrics.get("avg_response_time_ms", 0)
        if response_time > thresholds.get("response_time_ms", 30000):
            await self.send_alert(
                f"平均响应时间超过阈值: {response_time}ms (阈值: {thresholds['response_time_ms']}ms)",
                AlertSeverity.WARNING
            )
        
        # 检查失败任务数
        failed_tasks = metrics.get("failed_tasks", 0)
        if failed_tasks > thresholds.get("failed_tasks", 5):
            await self.send_alert(
                f"失败任务数超过阈值: {failed_tasks} (阈值: {thresholds['failed_tasks']})",
                AlertSeverity.ERROR
            )
