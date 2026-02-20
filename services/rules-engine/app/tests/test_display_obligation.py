from app.engine.rules.display_obligation import DisplayObligationRule
from app.models.request import EvaluationRequest, CompanyContext


def make_request(has_physical_site=True, employee_count=20):
    return EvaluationRequest(
        company=CompanyContext(
            company_id="test-id",
            employee_count=employee_count,
            has_physical_site=has_physical_site,
            sector="bureau",
        ),
        risks=[],
        actions=[],
        duerp_last_validated_at=None,
    )


def test_no_physical_site_passes():
    rule = DisplayObligationRule()
    result = rule.evaluate(make_request(has_physical_site=False))
    assert result.passed is True
    assert result.severity == "info"


def test_physical_site_under_50():
    rule = DisplayObligationRule()
    result = rule.evaluate(make_request(has_physical_site=True, employee_count=20))
    assert result.passed is True
    assert result.severity == "info"


def test_physical_site_50_plus_warning():
    rule = DisplayObligationRule()
    result = rule.evaluate(make_request(has_physical_site=True, employee_count=50))
    assert result.passed is True
    assert result.severity == "warning"
    assert result.details["requires_reglement_interieur"] is True


def test_physical_site_100_plus():
    rule = DisplayObligationRule()
    result = rule.evaluate(make_request(has_physical_site=True, employee_count=100))
    assert result.severity == "warning"
    assert result.details["employee_count"] == 100


def test_boundary_49_employees():
    rule = DisplayObligationRule()
    result = rule.evaluate(make_request(has_physical_site=True, employee_count=49))
    assert result.severity == "info"
    assert result.details["requires_reglement_interieur"] is False
