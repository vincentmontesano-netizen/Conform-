from app.engine.rules.epi_attribution import EpiMissingAttributionRule
from app.models.request import EvaluationRequest, CompanyContext, EpiContext

def make_request(epi=None):
    return EvaluationRequest(
        company=CompanyContext(
            company_id="test-id",
            employee_count=10,
            has_physical_site=True,
            sector="btp",
        ),
        risks=[],
        actions=[],
        epi=epi,
    )

def test_pass_no_epi_data():
    rule = EpiMissingAttributionRule()
    result = rule.evaluate(make_request())
    assert result.passed is True

def test_pass_all_equipped():
    rule = EpiMissingAttributionRule()
    epi = EpiContext(total_items=20, expired_items=0, items_without_controle=0, employees_without_epi=0)
    result = rule.evaluate(make_request(epi=epi))
    assert result.passed is True

def test_fail_employees_without_epi():
    rule = EpiMissingAttributionRule()
    epi = EpiContext(total_items=15, expired_items=0, items_without_controle=0, employees_without_epi=4)
    result = rule.evaluate(make_request(epi=epi))
    assert result.passed is False
    assert result.severity == "warning"
    assert "4 salarie" in result.message

def test_fail_single_employee():
    rule = EpiMissingAttributionRule()
    epi = EpiContext(total_items=10, expired_items=0, items_without_controle=0, employees_without_epi=1)
    result = rule.evaluate(make_request(epi=epi))
    assert result.passed is False
    assert "1 salarie" in result.message
