from app.engine.executor import RuleExecutor
from app.models.request import EvaluationRequest, CompanyContext, RiskItem, ActionItem

def test_full_evaluation():
    request = EvaluationRequest(
        company=CompanyContext(
            company_id="test-company",
            employee_count=25,
            has_physical_site=True,
            sector="bureau",
        ),
        risks=[
            RiskItem(
                risk_id="r1",
                category="RPS",
                severity="eleve",
                probability="probable",
                is_rps=True,
                work_unit_name="Bureau open space",
            ),
        ],
        actions=[
            ActionItem(
                action_id="a1",
                name="Formation gestion du stress",
                is_critical=True,
                has_proof=False,
                status="a_faire",
            ),
        ],
        duerp_last_validated_at=None,
    )

    executor = RuleExecutor()
    response = executor.evaluate(request)

    assert response.compliance_score.total_rules == 10
    assert response.compliance_score.score < 100
    assert len(response.alerts) > 0
