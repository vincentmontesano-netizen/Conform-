# Import all rules to trigger registration
from app.engine.rules.annual_update import AnnualUpdateRule
from app.engine.rules.critical_action import CriticalActionRule
from app.engine.rules.rps_detection import RPSDetectionRule
from app.engine.rules.display_obligation import DisplayObligationRule
from app.engine.rules.epi_expiry import EpiExpiryRule
from app.engine.rules.epi_attribution import EpiMissingAttributionRule
from app.engine.rules.formation_expiry import FormationExpiryRule
from app.engine.rules.formation_missing import FormationMissingRule
from app.engine.rules.registre_completeness import RegistreCompletenessRule
from app.engine.rules.registre_entry_expiry import RegistreEntryExpiryRule
