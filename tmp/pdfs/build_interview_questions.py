from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak, Table, TableStyle, Preformatted, KeepTogether
from reportlab.platypus.tableofcontents import TableOfContents
from xml.sax.saxutils import escape
import re

ROOT=Path(r'C:\Users\shub1\Github-Collabrator-Access-Manager')
OUT=ROOT/'output'/'pdf'/'GCAM-100-Project-Interview-Questions-and-Answers.pdf'
OUT.parent.mkdir(parents=True,exist_ok=True)
NAVY=colors.HexColor('#102A43'); BLUE=colors.HexColor('#176B87'); TEAL=colors.HexColor('#2A9D8F');
INK=colors.HexColor('#1F2933'); MUTED=colors.HexColor('#52606D'); LIGHT=colors.HexColor('#F4F7FA'); LINE=colors.HexColor('#CBD5E1'); GOLD=colors.HexColor('#F4B942')
ss=getSampleStyleSheet()
ss.add(ParagraphStyle(name='TitleX',fontName='Helvetica-Bold',fontSize=26,leading=31,textColor=NAVY,spaceAfter=10))
ss.add(ParagraphStyle(name='SubX',fontName='Helvetica',fontSize=11,leading=17,textColor=MUTED,spaceAfter=10))
ss.add(ParagraphStyle(name='H1X',fontName='Helvetica-Bold',fontSize=18,leading=22,textColor=NAVY,spaceBefore=8,spaceAfter=10,keepWithNext=True))
ss.add(ParagraphStyle(name='H2X',fontName='Helvetica-Bold',fontSize=12.5,leading=16,textColor=BLUE,spaceBefore=9,spaceAfter=5,keepWithNext=True))
ss.add(ParagraphStyle(name='QX',fontName='Helvetica-Bold',fontSize=10.2,leading=14,textColor=NAVY,spaceBefore=8,spaceAfter=4,keepWithNext=True))
ss.add(ParagraphStyle(name='BodyX',fontName='Helvetica',fontSize=8.4,leading=12,textColor=INK,spaceAfter=5))
ss.add(ParagraphStyle(name='Deep',fontName='Helvetica',fontSize=7.8,leading=11,textColor=INK,leftIndent=7,rightIndent=7,borderColor=TEAL,borderWidth=.7,borderPadding=6,backColor=colors.HexColor('#ECF8F6'),spaceAfter=6))
ss.add(ParagraphStyle(name='Src',fontName='Helvetica-Oblique',fontSize=6.6,leading=9,textColor=MUTED,spaceAfter=7))
ss.add(ParagraphStyle(name='CodeX',fontName='Courier',fontSize=6.5,leading=8.2,textColor=INK,backColor=LIGHT,borderPadding=7,spaceBefore=4,spaceAfter=8))
ss.add(ParagraphStyle(name='TOC1',fontName='Helvetica-Bold',fontSize=9.5,leading=14,textColor=NAVY,spaceBefore=3))
ss.add(ParagraphStyle(name='TOC2',fontName='Helvetica',fontSize=7.5,leading=11,textColor=INK,leftIndent=14))

def P(t,s='BodyX'): return Paragraph(escape(t).replace('\n','<br/>'),ss[s])
def R(t,s='BodyX'): return Paragraph(t,ss[s])
def C(t): return Preformatted(t,ss['CodeX'])

class Doc(BaseDocTemplate):
    def __init__(self,p):
        super().__init__(p,pagesize=A4,leftMargin=15*mm,rightMargin=15*mm,topMargin=17*mm,bottomMargin=15*mm,title='GCAM - 100 Project Interview Questions and Answers',author='Codex repository analysis')
        f=Frame(self.leftMargin,self.bottomMargin,self.width,self.height,id='f')
        self.addPageTemplates(PageTemplate(id='p',frames=[f],onPage=self.hf)); self.seen=False
    def beforeDocument(self): self.seen=False
    def hf(self,c,d):
        c.saveState(); w,h=A4
        if d.page>1:
            c.setStrokeColor(LINE); c.line(15*mm,h-11*mm,w-15*mm,h-11*mm)
            c.setFont('Helvetica',6.5); c.setFillColor(MUTED); c.drawString(15*mm,h-8.5*mm,'GCAM - 100 Project Interview Questions'); c.drawRightString(w-15*mm,8*mm,f'Page {d.page}')
        c.restoreState()
    def afterFlowable(self,f):
        if not isinstance(f,Paragraph): return
        if f.style.name not in ('H1X','H2X'): return
        if f.style.name=='H2X' and not self.seen: return
        lev=0 if f.style.name=='H1X' else 1
        if lev==0: self.seen=True
        txt=f.getPlainText(); key='x-'+re.sub('[^a-z0-9]+','-',txt.lower()).strip('-')
        self.canv.bookmarkPage(key); self.canv.addOutlineEntry(txt,key,level=lev,closed=False); self.notify('TOCEntry',(lev,txt,self.page,key))

# category, question, simple answer, deeper point, source
Q=[]
def add(cat,items):
    for q,a,d,s in items: Q.append((cat,q,a,d,s))

add('1. Project Overview and Business Problem',[
('What problem does this project solve?','It gives an administrator one place to see GitHub repository access, connect GitHub accounts to employees, and remove access when someone leaves.','The real value is governance: GitHub identity data is converted into employee-centered workflows, job records, approvals, and audit history.','README.md; DashboardService; OffboardingService'),
('Who is the main user?','The implemented user is a single administrator configured through environment variables.','The token type mentions ADMIN and VIEWER, but login always creates ADMIN and no role rule is enforced.','AuthController.java; lib/auth.ts'),
('What are the main features?','Sync GitHub data, browse repositories and collaborators, manage employees, map identities, remove access, approve bulk offboarding, and inspect audit/sync history.','Each feature has a UI flow, a Next.js API boundary, a Spring service, and PostgreSQL records.','src/app; backend/controller; prisma/schema.prisma'),
('How would you explain the project in 30 seconds?','It is a GitHub access-management application built with Next.js, Spring Boot, and PostgreSQL. It imports repository access, maps GitHub users to employees, and automates audited offboarding.','Mention the external GitHub API, the layered backend, and the approval flow to show full-stack understanding.','Repository-wide verified architecture'),
('Why is employee mapping necessary?','A GitHub username is a technical identity. Mapping it to an employee lets the company ask who owns the access and remove all access for that person.','The GithubUser table has an optional employee_id, so unmapped users can still exist after sync.','Employee.java; GithubUser.java; schema.prisma'),
('What is the difference between sync and offboarding?','Sync reads GitHub and builds the local inventory. Offboarding changes GitHub access and then updates the local inventory.','Sync is mainly reconciliation; offboarding is a destructive command workflow with partial-failure tracking.','SyncService.java; OffboardingService.java'),
('What does governance mean in this project?','It means recording approvals and audit events around sensitive access changes.','The strongest implemented governance case is bulk offboarding: a batch waits for an ApprovalRequest before execution.','GovernanceService.java'),
('What is implemented versus only documented?','Implementation means executable code exists. Some older docs mention hosting ideas, but current code verifies Docker and Render configuration.','Always answer from controllers, services, schemas, and deployment files before trusting design documents.','docker-compose.yml; render.yaml; git-collabration/README.md'),
('What is the most important end-to-end use case?','Sync GitHub, create an employee, map a GitHub user, then offboard that employee and remove repository access.','The integration test exercises exactly this lifecycle with a mocked GitHub client.','OnboardingWorkflowIntegrationTest.java'),
('What makes this project suitable for a Java interview?','It demonstrates REST controllers, service layering, JPA relationships, transactions, external APIs, error handling, and Docker.','It also gives honest improvement topics: Spring Security, DTO validation, migrations, and scalability.','backend/pom.xml and Java packages')])

add('2. High-Level and Low-Level Architecture',[
('What is the high-level architecture?','The browser talks to Next.js. Next.js calls Spring Boot. Spring Boot reads PostgreSQL and calls GitHub.','Nginx can sit in front in the production Compose overlay. Next.js also has limited direct Prisma access.','docker-compose.yml; nginx.conf; lib/backend.ts'),
('Why are there both Next.js API routes and Spring controllers?','Next routes give the browser a same-origin API and act as a server-side gateway. Spring owns the main business rules.','This resembles a backend-for-frontend pattern, although some logic is duplicated and the boundary is not perfectly clean.','src/app/api; backend/controller'),
('What is the request path for a normal button click?','Client component -> /api route in Next -> TypeScript service -> Spring controller -> Spring service -> repository or GitHub -> response -> UI refresh.','This path keeps database credentials and the GitHub PAT away from the browser.','components; services; lib/backend.ts'),
('How is the backend layered?','Controllers handle HTTP, services implement workflows, repositories perform persistence, and entities map tables.','There is no DTO layer; controllers use maps and expose entity-shaped responses.','backend/controller, service, repository, model'),
('What is a backend-for-frontend?','It is a server layer designed for one frontend. Here, Next route handlers translate browser requests into Spring calls.','The BFF can centralize cookies, response shaping, and same-origin access, but it should also consistently enforce authentication.','src/app/api; middleware.ts'),
('Why is business logic mainly in services?','It keeps controllers small and makes workflows reusable and transactional.','OffboardingService is large because it coordinates many related workflows; splitting command handlers could improve maintainability.','OffboardingService.java'),
('What is duplicated across layers?','Authentication endpoints and GitHub clients exist in both Next and Spring. Repository-removal permission checks are also repeated.','Duplication can drift and causes extra GitHub calls; choose one policy owner.','GitHubClientService.java; services/github/client.ts'),
('How do components depend on each other?','Controllers depend on services; services depend on repositories and integration clients; entities define relationships.','Spring dependency injection wires fields with @Autowired, including a @Lazy reference used to break the GovernanceService/OffboardingService cycle.','GovernanceService.java; OffboardingService.java'),
('Is this a microservice architecture?','No. It is a small distributed web application with a frontend server and one Spring backend service.','Calling it microservices would be misleading because the Java business domain is one deployable service and one database.','docker-compose.yml'),
('What architectural improvement would you make first?','Enforce authentication at both the Next API and Spring API boundaries.','After security, choose one migration owner and remove duplicated GitHub/policy logic.','middleware.ts; Spring controllers; schema configuration')])

add('3. Spring Boot, Controllers, and Services',[
('Why is Spring Boot used?','It provides an embedded web server, REST support, dependency injection, validation libraries, JPA, and test utilities.','The project uses Spring Boot 3.4.1 with Java 23.','backend/pom.xml'),
('What does @RestController do?','It marks a class as an HTTP controller whose return values are serialized as JSON responses.','Every backend controller uses it, and ResponseEntity controls status codes and headers.','backend/controller/*.java'),
('What does @RequestMapping do?','It sets a shared URL prefix for a controller, such as /api/repositories.','Method annotations then add GET, POST, PATCH, or DELETE behavior.','RepositoryController.java'),
('Why use ResponseEntity?','It lets the controller return a body, HTTP status, and headers explicitly.','Examples include 201 for creation, 302 for login redirects, 403 for missing GitHub admin permission, and 404 for missing resources.','backend/controller'),
('How does dependency injection work here?','Spring creates services and repositories and injects them into fields marked @Autowired.','Constructor injection would make dependencies clearer and easier to test, but field injection is the current implementation.','backend Java classes'),
('What does @Transactional provide?','It groups database operations so they commit together or roll back on failure.','EmployeeService, GovernanceService, and OffboardingService are transactional at class level.','service/*.java'),
('Why use REQUIRES_NEW?','It starts an independent transaction for one repository sync or one access deletion.','A failure in one item does not force all earlier successful items to roll back, enabling PARTIAL_SUCCESS.','SyncTransactionService; OffboardingTransactionService'),
('How is a circular service dependency handled?','GovernanceService injects OffboardingService with @Lazy.','The cycle exists because approval triggers bulk execution, while batch creation asks GovernanceService to create an approval. A separate workflow orchestrator would be cleaner.','GovernanceService.java; OffboardingService.java'),
('How are controller inputs validated?','Controllers manually check required fields and parse UUID values inside try/catch blocks.','spring-boot-starter-validation is installed, but DTO classes with @Valid are not implemented.','pom.xml; controllers'),
('How are exceptions handled?','Most controller methods catch Exception and return HTTP 400 with an error message.','There is no @RestControllerAdvice, typed exception hierarchy, or consistent error code, so client behavior is less precise.','backend/controller')])

add('4. Database, JPA, Prisma, and Transactions',[
('Which database is used?','PostgreSQL 16 is used in Docker, with JDBC for Spring and DATABASE_URL for Prisma.','The database runs on container port 5432 and defaults to host port 5433.','docker-compose.yml; application.properties'),
('What is JPA?','JPA is the Java standard for mapping objects to relational tables. Hibernate is the runtime implementation used by Spring Data JPA.','Entities use @Entity, @Table, @Id, relationships, lifecycle callbacks, and column mappings.','backend/model'),
('What is Prisma doing in a Spring project?','Prisma defines the same PostgreSQL schema, generates TypeScript types/client code, and supports a few direct Next operations.','Two ORMs against one schema create a drift risk and should have one migration owner.','prisma/schema.prisma; lib/prisma.ts'),
('What are the central entities?','Employee, GithubUser, Repository, and RepositoryAccess form the core access model.','Workflow entities add SyncJob, RemovalRequest, OffboardingJob, ApprovalRequest, BulkOffboardingBatch, and audit records.','backend/model; schema.prisma'),
('How is the many-to-many access relation modeled?','RepositoryAccess connects one GitHub user to one repository and stores permission, source, and sync time.','A unique constraint on repository_id plus github_user_id prevents duplicate access rows.','RepositoryAccess.java; schema.prisma'),
('What happens when a collaborator is removed locally?','The matching RepositoryAccess row is deleted. If the GitHub user has no remaining access, its employee mapping is cleared.','This behavior is implemented inside an isolated transaction.','OffboardingTransactionService.java'),
('How are timestamps maintained?','Entities set timestamps in field defaults and @PrePersist/@PreUpdate methods; Prisma also defines now() and @updatedAt.','Because both ORMs can write, timestamp behavior should be tested for consistency.','model classes; schema.prisma'),
('Are database migrations implemented?','No committed migration system is present. Spring uses Hibernate update and Next runs Prisma db push.','For production, use Flyway/Liquibase or Prisma migrations as the single versioned source of truth.','application.properties; docker-entrypoint.sh'),
('Which important constraints exist?','GitHub username and repository GitHub ID are unique; repository access pairs are unique; several foreign keys use cascade or set-null behavior.','Employee email uniqueness is checked by service code, not declared unique in the schema.','schema.prisma; EmployeeService.java'),
('Why can an external API and database not be one transaction?','PostgreSQL can roll back local changes, but it cannot undo a GitHub REST call automatically.','The code calls GitHub first and then updates the database; a DB failure afterward can leave temporary inconsistency requiring reconciliation.','OffboardingService.java')])

add('5. REST APIs and Data Flow',[
('What is the API style?','It uses JSON REST-like resources plus action endpoints such as /execute, /remove-all, and /remove-collaborators.','The action URLs represent business commands that do more than simple CRUD.','controllers; src/app/api'),
('What are the main repository endpoints?','GET repositories, metrics, detail, and access; POST remove-collaborators.','The detail identifier accepts either a UUID or a numeric GitHub repository ID.','RepositoryController.java'),
('What are the main employee endpoints?','List, create, get, update, delete, and map a GitHub user.','Create returns 201, get may return 404, and manual validation errors normally return 400.','EmployeeController.java'),
('How does the sync endpoint behave?','POST /api/sync starts synchronous synchronization and GET returns the latest twenty jobs.','If initial GitHub fetching fails, runSync returns a failure object that the controller still sends as HTTP 200.','SyncController.java; SyncService.java'),
('What is returned by removal operations?','A summary with removed/failed counts and per-repository or per-user results.','This supports partial success and lets the UI explain exactly what failed.','OffboardingService.java'),
('How are query parameters used?','q filters employees, collaborators, and repositories; visibility filters repositories.','Repository queries use case-insensitive JPQL LIKE expressions.','repositories; RepositoryRepository.java'),
('Why are action responses wrapped in maps?','Maps quickly create JSON objects such as {employee: ...} or {result: ...}.','They are flexible but not compile-time safe; response DTOs would improve documentation and stability.','backend/controller'),
('How are status codes selected?','200 for successful reads/actions, 201 for created records, 302 for auth redirects, 400 for most errors, 403 for permission denial, and 404 for missing detail resources.','Many distinct server problems become 400 because of broad exception catches.','backend/controller'),
('Is API documentation generated?','No OpenAPI or Swagger configuration exists.','The production improvement is springdoc-openapi plus typed DTO schemas and examples.','pom.xml; repository search'),
('How would you trace POST /api/employees?','Browser form -> Next route -> employee-service.ts -> Spring EmployeeController -> EmployeeService -> EmployeeRepository -> PostgreSQL -> JSON response -> UI refresh.','The Next handler also records an audit event after the Spring create call.','employee-form.tsx; api/employees; EmployeeService.java')])

add('6. GitHub Integration and Synchronization',[
('How does GitHub authentication work?','The server reads GITHUB_PAT and sends it as an Authorization: Bearer header.','The token never needs to reach browser JavaScript. Missing token causes an explicit error.','GitHubClientService.java'),
('Which GitHub endpoints are called?','User repositories, repository collaborators, collaborator permission, repository detail, authenticated user, and collaborator deletion.','The code sets the GitHub API version header to 2022-11-28.','GitHubClientService.java'),
('How are all repositories fetched?','The client calls /user/repos with 100 items per page until a page contains fewer than 100.','It sorts by update time descending but does not use GITHUB_OWNER to filter repositories.','GitHubClientService.getRepositories'),
('How are collaborator permissions fetched?','After listing collaborators for a repository, the backend calls the permission endpoint once for every collaborator.','This is accurate but expensive and can approach rate limits for large installations.','SyncService.java'),
('How does rate-limit handling work?','For a 403 with x-ratelimit-remaining equal to zero, it waits until the reset time and retries once.','There is no exponential backoff, jitter, circuit breaker, or handling for secondary rate limits.','GitHubClientService.requestJson'),
('What timeout behavior exists?','Java HttpClient has a ten-second connection timeout.','No per-request response timeout is configured, so a connected request could wait longer than intended.','GitHubClientService.java'),
('How does sync update local access?','For each repository, it upserts the repository, deletes its old access rows, upserts GitHub users, and inserts the current access rows.','The unit runs in REQUIRES_NEW, so one bad repository becomes a failed detail rather than aborting the full sync.','SyncTransactionService.java'),
('How are deleted repositories handled?','After sync, local repositories not present in the fetched GitHub IDs are marked inactive.','Records are preserved for history instead of being deleted.','SyncService.runSync'),
('How is collaborator deletion performed?','The backend sends DELETE /repos/{owner}/{repo}/collaborators/{username}.','A GitHub not-found error is treated as already removed, but detection relies on the exception message containing “not found.”','OffboardingService.java'),
('Why are there two GitHub clients?','Spring has the main client, while Next has another client used in the repository-removal pre-check.','This repeats permission calls and logic. The cleaner design is for Spring to own integration and policy.','Java and TypeScript GitHub clients')])

add('7. Frontend, Next.js, and UI Flows',[
('Which frontend framework is used?','Next.js 15 App Router with React 19 and TypeScript.','Pages mix server components for data loading with client components for interactive forms and buttons.','git-collabration/package.json; src/app'),
('What is a server component here?','An async page component that loads data on the server and returns HTML.','Repository, employee, dashboard, governance, and status pages fetch through service functions before rendering.','src/app/**/page.tsx'),
('What is a client component?','A component marked use client that uses state, effects, event handlers, and browser fetch.','Examples include SyncButton, EmployeeForm, GovernanceConsole, and removal consoles.','src/components'),
('How is routing handled?','Folders under src/app define routes, and [id] folders define dynamic parameters.','Navigation uses Link; client actions use useRouter for replace, refresh, or navigation.','src/app; components'),
('How is frontend state managed?','Local React useState/useMemo/useEffect handles form, selection, loading, status, and filter state.','There is no Redux, Zustand, or global server-state library.','src/components'),
('How does the UI report progress?','Buttons set loading flags, disable repeated actions, and show inline messages or Toast components.','After success, router.refresh re-renders server data.','SyncButton; removal components'),
('How are destructive actions confirmed?','DialogProvider exposes promise-based confirm and alert dialogs.','Repository and collaborator removal buttons wait for confirmation before making requests.','dialog-provider.tsx'),
('How does repository filtering work?','RepositoryBrowser filters the already-loaded list in the browser by query and visibility.','The backend also supports q and visibility, but this UI component performs its displayed filtering locally.','repository-browser.tsx'),
('What happens when backend reads fail?','Several service functions catch errors and return empty arrays or zero-value objects.','This avoids crashing the page but can make an outage look like “no data,” so visible error states would be better.','frontend services'),
('What is the purpose of fetchBackend?','It builds the Spring URL, adds JSON headers, disables caching, parses errors, and returns typed JSON.','It is the common server-to-server adapter from Next to Spring.','lib/backend.ts')])

add('8. Authentication, Authorization, and Security',[
('How does login work?','Configured username/password are compared, then an HMAC-SHA256 signed payload is stored in gcam_session.','Next sets HttpOnly, SameSite=Lax, and Secure in production. The Spring version sets HttpOnly but Secure false.','api/auth/login; AuthController.java'),
('What is inside the session token?','A Base64URL JSON payload with username and role, followed by an HMAC signature.','It is not encrypted, so the payload can be read; the signature prevents undetected modification.','lib/auth.ts; SessionManager.java'),
('Does the token expire?','No expiration field is included in the signed payload.','The Next cookie has no explicit maxAge, while the Spring cookie uses 24 hours. A robust token should include expiry and rotation/revocation rules.','auth implementations'),
('How does middleware protect routes?','It redirects to login when the cookie is missing.','It checks only cookie presence, not the HMAC signature. PageShell verifies pages, but API route handlers do not consistently verify a session.','middleware.ts; PageShell'),
('Are Spring endpoints authenticated?','No Spring Security filter or interceptor protects the controllers.','If the backend URL is reachable, callers can directly invoke endpoints. This is the highest-priority production gap.','pom.xml; controllers'),
('Is role-based access control implemented?','No. Role values exist, but actions do not check ADMIN versus VIEWER.','A real design would map permissions to endpoints/actions and enforce them in both layers.','lib/auth.ts; controller code'),
('How are secrets managed?','Values come from environment variables and Render environment groups.','Defaults such as admin/change-me and a placeholder session secret are unsafe if not replaced. Secrets are not printed in this guide.','env.ts; compose; render.yaml'),
('What CSRF protection exists?','No explicit CSRF token mechanism is implemented.','SameSite=Lax helps some cases, but state-changing cookie-authenticated routes should have deliberate CSRF controls.','auth routes; middleware'),
('What security checks exist before repository removal?','The code verifies the PAT has repository admin permission and blocks removing the authenticated admin account.','The check is performed in both Next and Spring, which is safer than UI-only enforcement but duplicates calls.','remove-collaborators routes/controllers'),
('What security improvements should be prioritized?','Add Spring Security, verify sessions on every Next API route, add expiry and CSRF protection, reject weak secrets, validate DTOs, and add rate limiting.','Also minimize raw external error details and add CSP/HSTS where TLS termination is controlled.','Verified gap analysis')])

add('9. Docker, Configuration, and Deployment',[
('Which containers run locally?','PostgreSQL, Spring Boot backend, and Next.js frontend. The production overlay adds Nginx.','They share the gcam-network bridge and have health checks and log rotation.','docker-compose.yml; docker-compose.prod.yml'),
('How does service startup order work?','Backend waits for a healthy database; frontend waits for healthy database and backend.','Compose dependency health reduces startup races but does not replace application retry logic.','docker-compose.yml'),
('How is database data persisted?','A named Docker volume stores /var/lib/postgresql/data.','Removing containers keeps data; removing the volume deletes it.','docker-compose.yml'),
('How are the images built?','Both use multi-stage builds. Maven builds the JAR; Node installs dependencies and builds Next.','Runtime images contain only the needed artifacts and run as non-root users.','backend/Dockerfile; frontend/Dockerfile'),
('What does the frontend entrypoint do?','It retries prisma db push up to fifteen times, then starts Next.','This helps cold starts but is not a versioned migration process.','docker-entrypoint.sh'),
('What does Nginx provide?','Reverse proxying, gzip, static asset caching, request size limit, timeouts, and some security headers.','It routes all application traffic to Next, not directly to Spring.','nginx/nginx.conf'),
('How is Render configured?','render.yaml defines managed PostgreSQL plus Docker backend and frontend services with shared environment variables.','The frontend calls a configured backend URL and both expose health endpoints.','render.yaml'),
('Are CI/CD pipelines present?','No GitHub Actions or other CI configuration was found.','Render may deploy from repository changes externally, but that automation is not defined as a checked-in workflow.','repository file inventory'),
('Why does the backend Docker build skip tests?','The image build uses mvn clean package -DskipTests to reduce build dependency/time.','A separate CI test stage should run tests before image publication.','backend/Dockerfile'),
('What configuration risk exists across environments?','Different defaults, published backend/database ports, and stale README hosting notes can confuse deployment expectations.','Keep one deployment runbook and validate required production variables at startup.','compose; render; READMEs')])

add('10. Testing, Error Handling, Performance, and Improvements',[
('What automated tests exist?','A Spring integration test uses MockMvc and a mocked GitHub client.','It covers health, full sync-to-offboarding, bulk approval/execution, and repository permission validation.','OnboardingWorkflowIntegrationTest.java'),
('What does the integration test verify after sync?','Repository, GitHub user, and access records exist with the expected values.','It then creates an employee, maps the user, creates and executes offboarding, and checks access deletion.','OnboardingWorkflowIntegrationTest.java'),
('What test gaps remain?','No frontend tests, security tests, live GitHub contract tests, load tests, or migration tests were found.','Add component tests, API authorization tests, Testcontainers PostgreSQL, and contract tests around GitHub responses.','repository test inventory'),
('How are errors logged?','Spring enables package DEBUG and SQL display; code uses System.out/err. Next uses console.error. Docker rotates JSON logs.','Structured logging, correlation IDs, and secret redaction are not implemented.','application.properties; services; compose'),
('How are partial failures represented?','Sync and offboarding count errors and set SUCCESS, FAILED, or PARTIAL_SUCCESS-like states.','Per-repository job items and result arrays retain detailed outcomes.','SyncService; OffboardingService'),
('What are likely performance bottlenecks?','GitHub permission calls per collaborator, relationship loading, findAll filtering of removal requests, and synchronous bulk execution.','Large installations need pagination, targeted queries, batching, queues, and controlled concurrency.','SyncService; OffboardingService'),
('What is an N+1 problem in this project?','One initial collaborator list is followed by one permission request per collaborator; ORM relationship traversal can also issue many queries.','Measure both external call count and SQL query count before optimizing.','SyncService; entity fetch strategies'),
('How would you make sync asynchronous?','POST would create a queued job and return 202. A worker would process repositories and update progress.','The UI could poll or use server-sent events, and retries could happen per repository.','Recommended design based on SyncJob model'),
('How would you improve error handling?','Use typed exceptions, @RestControllerAdvice, stable error codes, correct status codes, and visible frontend failure states.','Separate validation, not-found, conflict, authorization, external dependency, and internal errors.','Current controller behavior'),
('What is your final technical assessment?','The project has strong end-to-end workflows and good interview coverage, but needs security enforcement and migration discipline before production use.','Next priorities are auth, one schema owner, DTO/error contracts, deduplicated integration logic, targeted queries, and broader tests.','Repository-wide verified assessment')])

assert len(Q)==100, len(Q)

diagrams={
'1. Project Overview and Business Problem':('Project in one view','''GitHub repositories + collaborators\n              | sync\n              v\n       Local access inventory\n              | map identities\n              v\n     Employees <-> GitHub users\n              | offboard / approve / audit\n              v\n       Controlled access removal'''),
'2. High-Level and Low-Level Architecture':('Runtime architecture','''Browser\n  | HTTP pages + /api + signed cookie\n  v\nNext.js (UI + API gateway)\n  | HTTP JSON via SPRING_BOOT_URL\n  v\nSpring Boot (controllers -> services -> repositories)\n  | JPA/JDBC                    | HTTPS bearer PAT\n  v                             v\nPostgreSQL                  GitHub REST API'''),
'3. Spring Boot, Controllers, and Services':('Backend layers','''HTTP request\n   v\n@RestController  - status, path, basic validation\n   v\n@Service         - business workflow + transactions\n   v\nJpaRepository    - generated queries / JPQL\n   v\nPostgreSQL'''),
'4. Database, JPA, Prisma, and Transactions':('Core ER model','''Employee 1 ---- * GithubUser\nGithubUser 1 ---- * RepositoryAccess * ---- 1 Repository\nEmployee 1 ---- * OffboardingJob 1 ---- * JobItem\nGithubUser 1 ---- * RemovalRequest * ---- 1 Repository\nApprovalRequest 1 ---- 0..1 BulkBatch 1 ---- * BatchItem'''),
'5. REST APIs and Data Flow':('Example request flow','''EmployeeForm\n  -> Next POST /api/employees\n  -> employee-service.ts / fetchBackend\n  -> Spring EmployeeController.createEmployee\n  -> EmployeeService.createEmployee\n  -> EmployeeRepository.save\n  -> PostgreSQL\n  <- 201 { employee } -> router.refresh()'''),
'6. GitHub Integration and Synchronization':('Sync sequence','''Admin -> POST /api/sync -> create RUNNING SyncJob\n  -> GitHub GET /user/repos (paged)\n     -> each repo: collaborators (paged)\n        -> each collaborator: permission\n        -> REQUIRES_NEW upsert repo/users/access\n  -> mark missing repositories inactive\n  -> finalize SUCCESS / PARTIAL_SUCCESS / FAILED + audit'''),
'7. Frontend, Next.js, and UI Flows':('UI navigation','''Login -> Dashboard -> Sync Status\n          |-> Repositories -> Detail -> Remove selected\n          |-> Collaborators -> Remove from all repos\n          |-> Employees -> Detail / map / remove access\n          |-> Offboarding -> direct or bulk request\n          +-> Governance -> approve/reject + audit'''),
'8. Authentication, Authorization, and Security':('Current authentication boundary','''Request -> Next middleware\n  no cookie -> /login\n  any cookie -> allowed\n      page -> PageShell verifies HMAC\n      API route -> no consistent verification\nSpring API -> no Spring Security filter\n\nVerified gap: presence is not the same as authentication.'''),
'9. Docker, Configuration, and Deployment':('Container topology','''Host :80 -> Nginx (production overlay) -> Next :3000\n                                      |\n                                      v\n                                 Spring :8080 -> GitHub :443\n                                      |\n                                      v\n                               PostgreSQL :5432\nNamed volume: postgres_data; network: gcam-network'''),
'10. Testing, Error Handling, Performance, and Improvements':('Improvement roadmap','''1. Enforce auth + authorization\n2. Choose one versioned migration system\n3. DTO validation + global error contract\n4. Remove duplicated GitHub logic\n5. Targeted queries + async jobs + rate control\n6. Frontend, security, contract, and load tests''')}

story=[]
story += [Spacer(1,32*mm),P('100 Project Interview Questions and Answers','TitleX'),P('Git Collaborator Access Manager','SubX'),R('<b>Deep-dive study guide for Java backend and full-stack interviews</b><br/>Verified against the repository implementation on branch <b>testing</b><br/>Generated 29 September 2026','Deep'),Spacer(1,12*mm),P('How to use this guide','H2X'),P('Read the simple answer first. Use the “Interview depth” paragraph when the interviewer asks why, what could fail, or how you would improve it. Source references show where to locate the implementation. Diagrams are deliberately small and explain the relationships most likely to be discussed.'),P('Accuracy note','H2X'),P('Answers describe the current code, even when the implementation has a limitation. Recommendations are clearly labeled as improvements. No secrets or environment values are included.')]
story += [PageBreak(),P('Table of Contents','H1X')]
toc=TableOfContents(); toc.levelStyles=[ss['TOC1'],ss['TOC2']]; story += [toc,PageBreak()]

num=0
last=None
for cat,q,a,d,s in Q:
    if cat!=last:
        if last is not None: story.append(PageBreak())
        story.append(P(cat,'H1X'))
        title,dg=diagrams[cat]
        story += [P(title,'H2X'),C(dg),P('How to explain the diagram: '+({'1. Project Overview and Business Problem':'Start with GitHub data, then show how identity mapping enables governed removal.','2. High-Level and Low-Level Architecture':'Follow one request downward from browser to data/external API, then return the response upward.','3. Spring Boot, Controllers, and Services':'Explain that each layer has one main responsibility and depends on the layer below.','4. Database, JPA, Prisma, and Transactions':'RepositoryAccess is the central many-to-many bridge; workflow tables preserve operational history.','5. REST APIs and Data Flow':'Name each boundary so the interviewer sees that you can trace a request end to end.','6. GitHub Integration and Synchronization':'Emphasize pagination, per-collaborator permission calls, isolated repository transactions, and final status.','7. Frontend, Next.js, and UI Flows':'Show the dashboard as the hub and describe the major destructive flows.','8. Authentication, Authorization, and Security':'The diagram exposes the exact gap: cookie presence is checked earlier than signature verification, and Spring is unprotected.','9. Docker, Configuration, and Deployment':'Separate host ports from internal container ports and show that only Spring calls GitHub.','10. Testing, Error Handling, Performance, and Improvements':'Present improvements in risk order rather than starting with cosmetic refactoring.'})[cat],'Deep')]
        last=cat
    num+=1
    story.append(P(f'{num}. {q}','QX'))
    story.append(R('<b>Simple answer:</b> '+escape(a),'BodyX'))
    story.append(R('<b>Interview depth:</b> '+escape(d),'Deep'))
    story.append(R('<b>Verified source:</b> '+escape(s),'Src'))

story += [PageBreak(),P('Rapid Revision Sheet','H1X'),P('Use these points in the last ten minutes before an interview.')]
for x in ['Stack: Next.js 15 + React 19 + Spring Boot 3.4.1 + Java 23 + PostgreSQL 16.','Core model: Employee -> GithubUser -> RepositoryAccess -> Repository.','Sync: paged GitHub reads, per-user permission calls, isolated repository transactions, job/audit records.','Offboarding: GitHub deletion first, local deletion second, partial-failure reporting.','Governance: bulk batch -> approval -> synchronous per-employee jobs.','Security truth: signed cookies exist, but Next API and Spring enforcement are incomplete.','Schema truth: Prisma db push and Hibernate update both act on the database; no migrations.','Deployment: Compose has DB/backend/frontend; optional Nginx; Render blueprint exists.','Best improvement answer: security first, migrations second, DTO/errors third, then scalability/tests.']:
    story.append(R('&#8226; '+escape(x),'BodyX'))
story += [P('A strong closing answer','H2X'),R('“The project proves the complete business workflow and demonstrates Spring layering, JPA relationships, transactions, external API integration, and full-stack request tracing. I can also explain its current production risks honestly: authentication enforcement, schema ownership, duplicated GitHub logic, synchronous scaling, and test coverage. My improvement plan starts with security and data safety before performance tuning.”','Deep')]

Doc(str(OUT)).multiBuild(story)
print(OUT)
