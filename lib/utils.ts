/**
 * 获取工作价值评估结果的描述
 * @param score 评估分数
 * @returns 评估描述和颜色
 */
export function getValueAssessment(score: number): { key: string; text: string; color: string } {
  if (score < 0.6) return { key: 'rating_terrible', text: '极差', color: "text-pink-800" };
  if (score < 1.0) return { key: 'rating_poor', text: '较差', color: "text-red-500" };
  if (score <= 1.8) return { key: 'rating_average', text: '一般', color: "text-orange-500" };
  if (score <= 2.5) return { key: 'rating_good', text: '良好', color: "text-blue-500" };
  if (score <= 3.2) return { key: 'rating_great', text: '很好', color: "text-green-500" };
  if (score <= 4.0) return { key: 'rating_excellent', text: '优秀', color: "text-purple-500" };
  return { key: 'rating_perfect', text: '完美', color: "text-yellow-400" };
}

/**
 * 获取改进建议
 * @param details 评估详情
 * @returns 改进建议
 */
export function getImprovementSuggestions(details: {
  commuteHours: number;
  workHours: number;
  cityFactor: string;
  workEnvironment: string;
  leadership: string;
  teamwork: string;
}): string[] {
  const suggestions: string[] = [];

  // 通勤时间建议
  if (details.commuteHours > 2) {
    suggestions.push('通勤时间过长，考虑搬家或寻找离家更近的工作，以减少通勤压力。');
  }

  // 工作时间建议
  if (details.workHours > 10) {
    suggestions.push('工作时间过长，可能影响健康和工作效率，建议与管理层沟通改善工作时间安排。');
  }

  // 城市因素建议
  if (parseFloat(details.cityFactor) < 0.8) {
    suggestions.push('当前城市生活成本较高，可以考虑寻找薪资更高的职位或探索远程工作机会。');
  }

  // 工作环境建议
  if (parseFloat(details.workEnvironment) < 1.0) {
    suggestions.push('工作环境有待改善，可以与HR沟通或考虑寻找办公条件更好的职位。');
  }

  // 领导关系建议
  if (parseFloat(details.leadership) < 0.9) {
    suggestions.push('与领导的关系可能需要改善，建议主动沟通，增进理解，或考虑部门调动。');
  }

  // 同事关系建议
  if (parseFloat(details.teamwork) < 1.0) {
    suggestions.push('团队协作氛围有待提升，可以主动参与团队活动，改善与同事的关系。');
  }

  // 如果没有具体建议，给出一般性建议
  if (suggestions.length === 0) {
    suggestions.push('您的工作环境整体良好，可以考虑进一步提升专业技能，为职业发展创造更多机会。');
  }

  return suggestions;
}

/**
 * 格式化日期
 * @param date 日期对象或字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * 生成唯一ID
 * @returns 唯一ID字符串
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * 安全解析JSON
 * @param str JSON字符串
 * @param fallback 解析失败时的默认值
 * @returns 解析结果
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch (error) {
    return fallback;
  }
}

/**
 * 获取客户端信息
 * @returns 客户端信息对象
 */
export function getClientInfo(): {
  ip?: string;
  userAgent?: string;
} {
  if (typeof window === 'undefined') {
    return {};
  }

  return {
    userAgent: window.navigator.userAgent,
    // IP需要在服务端获取
  };
}

/**
 * 防抖函数
 * @param fn 要执行的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>): void {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

/**
 * 节流函数
 * @param fn 要执行的函数
 * @param limit 时间限制（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(fn: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return function(...args: Parameters<T>): void {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
} 