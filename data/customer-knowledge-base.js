(function defineCustomerKnowledgeBase() {
  const knowledgeBase = {
    version: '2026.08.07',
    locale: 'zh-CN',
    suggestions: [
      '你们可以定制哪些 Agent？',
      '能接入我们的 CRM 和 ERP 吗？',
      '如何控制回答错误和误操作？',
      '项目应该从哪里开始？'
    ],
    entries: [
      {
        id: 'service-overview',
        title: '企业级 Agent 定制服务',
        category: 'service',
        keywords: ['服务', '业务', '能力', '定制', 'agent', '智能体', '做什么', '可以做'],
        questionPatterns: ['你们提供什么服务', '可以定制哪些 Agent', '主要能力是什么'],
        answer: 'xnan.cn 提供企业级 AI Agent 的咨询、定制开发、系统集成与私有化部署。我们从真实业务流程出发，让 Agent 能理解企业知识、调用业务系统、遵循审批规则，并在异常时交还给人工。',
        links: [{ label: '查看核心能力', href: '#capabilities' }]
      },
      {
        id: 'customer-service-agent',
        title: '智能客服 Agent',
        category: 'service',
        keywords: ['客服', '咨询', '工单', '企微', '网页', '飞书', '转人工', '多渠道'],
        questionPatterns: ['智能客服能做什么', '能不能自动转人工', '支持哪些客服渠道'],
        answer: '智能客服 Agent 可以统一承接网页、企业微信、飞书等渠道咨询，基于企业知识准确应答，并在复杂或高风险问题上自动转人工。还可联动工单系统、追踪回答来源并分析服务质量。',
        links: [{ label: '查看 Agent 组合', href: '#capabilities' }]
      },
      {
        id: 'knowledge-agent',
        title: '企业知识库与知识 Agent',
        category: 'service',
        keywords: ['知识库', '知识', '文档', '制度', '资料', '检索', '溯源', '同步', '更新'],
        questionPatterns: ['没有知识库可以做吗', '如何构建企业知识库', '文档怎么同步'],
        answer: '可以从零开始。知识梳理本身就是交付的一部分：先评估文档、数据库和业务人员经验，再完成分类、清洗、权限、版本与更新机制设计。回答可保留来源引用，便于核验和持续治理。',
        links: [{ label: '了解知识层架构', href: '#architecture' }]
      },
      {
        id: 'sales-agent',
        title: '销售协同 Agent',
        category: 'service',
        keywords: ['销售', '线索', '客户', '跟进', 'crm', '商机', '材料'],
        questionPatterns: ['销售 Agent 能做什么', '能更新 CRM 吗', '如何处理销售线索'],
        answer: '销售协同 Agent 可以识别线索意向、补全客户信息、生成跟进建议与销售材料，并将关键进展写回 CRM。具体动作会依据角色权限和业务规则执行。',
        links: [{ label: '查看核心能力', href: '#capabilities' }]
      },
      {
        id: 'automation-agent',
        title: '流程自动化 Agent',
        category: 'service',
        keywords: ['流程', '自动化', '审批', '表单', '数据库', '重复任务', '工具调用'],
        questionPatterns: ['能自动执行任务吗', '可以做流程自动化吗', '如何跨系统操作'],
        answer: '流程自动化 Agent 可跨表单、审批、数据库和业务系统执行规则明确的重复任务。关键动作可设置人工审批，异常会进入兜底流程并保留完整日志。',
        links: [{ label: '查看系统架构', href: '#architecture' }]
      },
      {
        id: 'system-integration',
        title: '现有系统与渠道接入',
        category: 'scenario',
        keywords: ['接入', '集成', 'crm', 'erp', 'oa', 'api', '数据库', '企业微信', '飞书', '钉钉', '旧系统'],
        questionPatterns: ['能接入 CRM 和 ERP 吗', '没有 API 怎么办', '支持哪些系统'],
        answer: '具备稳定接口的 CRM、ERP、OA、工单、审批、数据库和自有 API 通常都能接入。没有标准 API 的旧系统，需要进一步评估数据库、中间服务或合规的自动化方案。',
        links: [{ label: '查看集成架构', href: '#architecture' }]
      },
      {
        id: 'security-governance',
        title: '安全、权限与审计',
        category: 'security',
        keywords: ['安全', '权限', '审计', '日志', '合规', '风险', '数据', '隔离', '审批', '误操作', '幻觉', '错误'],
        questionPatterns: ['如何避免错误答案', '怎么防止误操作', '数据安全吗'],
        answer: '风险控制由知识引用、权限隔离、规则校验、工具白名单、关键动作审批和人工接管共同完成。系统会记录检索来源、模型输出、工具调用与最终结果，便于审计和持续评测。',
        links: [{ label: '查看安全治理', href: '#security' }]
      },
      {
        id: 'deployment-options',
        title: '部署方式与模型选择',
        category: 'security',
        keywords: ['部署', '私有化', '专有云', '云端', '模型', '厂商', '本地', '数据边界'],
        questionPatterns: ['支持私有化部署吗', '绑定哪个模型', '数据放在哪里'],
        answer: '支持云端、专有云或私有化部署，具体方式根据数据敏感度和现有基础设施确定。方案不绑定单一模型厂商，会围绕企业的数据、权限、渠道、成本与任务质量选择合适引擎。',
        links: [{ label: '查看安全治理', href: '#security' }]
      },
      {
        id: 'delivery-process',
        title: '项目交付流程',
        category: 'delivery',
        keywords: ['交付', '流程', '步骤', '周期', '上线', '原型', 'poc', '诊断', '运营', '验收'],
        questionPatterns: ['项目怎么交付', '实施流程是什么', '多久可以上线'],
        answer: '项目通常经过业务诊断、原型验证、系统交付和持续运营四个阶段。每阶段都有明确产物与决策门槛；具体周期需要结合场景范围、数据准备、系统接口和安全要求评估。',
        links: [{ label: '查看交付体系', href: '#delivery' }]
      },
      {
        id: 'project-start',
        title: '适合的项目起点',
        category: 'delivery',
        keywords: ['开始', '起步', '范围', '场景', '试点', '第一步', '评估', '验证'],
        questionPatterns: ['项目应该从哪里开始', '第一阶段做多大', '怎么选择试点'],
        answer: '建议从业务量稳定、规则清晰、结果可衡量的单一场景开始。先用真实数据完成原型验证和评测基线，再决定是否扩展到更多部门、渠道与系统。',
        links: [{ label: '预约方案会', href: '#contact' }]
      },
      {
        id: 'industries',
        title: '适用行业与场景',
        category: 'scenario',
        keywords: ['行业', '制造', '工业', '零售', '连锁', '教育', '培训', '专业服务', '售后', '门店'],
        questionPatterns: ['适合哪些行业', '有哪些落地场景', '制造业能做吗'],
        answer: '当前重点场景包括制造与工业的设备知识和售后服务、专业服务的知识检索与项目协作、连锁零售的门店运营与客户服务，以及教育培训的课程顾问和学习服务。方案会按实际业务重新设计。',
        links: [{ label: '查看业务场景', href: '#scenarios' }]
      },
      {
        id: 'pricing',
        title: '项目报价与评估',
        category: 'delivery',
        keywords: ['价格', '费用', '报价', '预算', '多少钱', '成本', '收费'],
        questionPatterns: ['做一个 Agent 多少钱', '如何报价', '项目费用是多少'],
        answer: '定制项目需要根据业务范围、知识与数据规模、系统接口、部署方式和安全要求评估，暂不采用统一套餐价。建议先进行 30 分钟方案沟通，明确第一阶段验证范围后再提供方案与报价。',
        links: [{ label: '预约方案会', href: '#contact' }]
      },
      {
        id: 'contact',
        title: '联系人工顾问',
        category: 'contact',
        keywords: ['联系', '人工', '顾问', '邮箱', '邮件', '微信', '电话', '客服', '预约'],
        questionPatterns: ['怎么联系你们', '我要转人工', '如何预约沟通'],
        answer: '可以通过邮箱 hi@xnan.ai、微信 SeeYouClaw 或电话 176 1143 1021 联系人工顾问。建议在消息中简单说明业务场景、现有系统和希望优先解决的问题。',
        links: [
          { label: '发送邮件', href: 'mailto:hi@xnan.ai' },
          { label: '查看联系方式', href: '#contact' }
        ]
      }
    ]
  };

  window.XNAN_CUSTOMER_KB = Object.freeze(knowledgeBase);
})();
