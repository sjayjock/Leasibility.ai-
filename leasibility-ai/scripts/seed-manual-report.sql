DELETE FROM reportViews;
DELETE FROM shareTokens;
DELETE FROM scenarios;
DELETE FROM projects;
DELETE FROM brokerProfiles;
DELETE FROM users;

INSERT INTO users (id, openId, name, email, loginMethod, role, analysisCount, lastSignedIn)
VALUES (1, 'manual-test-user', 'Manual Test Broker', 'test@leasibility.ai', 'seed', 'admin', 0, NOW());

INSERT INTO brokerProfiles (userId, brokerName, brokerTitle, brokerEmail, brokerCompany, profileComplete, onboardingCompleted)
VALUES (1, 'Manual Test Broker', 'Tenant Representation Advisor', 'test@leasibility.ai', 'Leasibility AI QA', true, true);

INSERT INTO projects (id, userId, propertyName, propertyAddress, city, state, market, totalSqFt, floorNumber, floorPlanUrl, inputMethod, status, tenantName, headcount, industry, programNotes)
VALUES (1, 1, 'Diagnostic Office Floor Plan Upload', '1250 Market Street', 'San Francisco', 'CA', 'San Francisco', 28000, '12', '/diagnostic-floor-plan-upload.pdf', 'upload', 'complete', 'Growth Software Tenant', 148, 'Technology', 'Diagnostic seed from a representative office plan upload; use for manual UI review only until a real customer floor plan and API keys are configured.');

INSERT INTO shareTokens (token, projectId, userId, viewCount, isActive)
VALUES ('manual-test-report-20260518', 1, 1, 0, true);

INSERT INTO scenarios (
  projectId, scenarioNumber, impactLevel, label, efficiencyScore, usableSqFt, totalSqFt, roomBreakdown,
  layoutDescription, layoutSvg, budgetLow, budgetMid, budgetHigh, costPerSqFtLow, costPerSqFtMid, costPerSqFtHigh,
  budgetBreakdown, scheduleWeeksLow, scheduleWeeksMid, scheduleWeeksHigh, schedulePhases,
  requestedProgram, existingConditions, achievedProgram, fitVariance, reuseStrategy, changeSummary, qaWarnings, validationStatus, aiSummary
) VALUES
(1, 1, 'low', 'Reuse Existing Layout', 84, 25200, 28000,
 JSON_ARRAY(JSON_OBJECT('type','Open Workstations','count',118,'sqFt',7080),JSON_OBJECT('type','Private Offices','count',10,'sqFt',1600),JSON_OBJECT('type','Meeting Rooms','count',8,'sqFt',2200),JSON_OBJECT('type','Support / Amenity','count',1,'sqFt',3800)),
 'Retains the existing workstation neighborhoods, reuses enclosed rooms where possible, and focuses spend on finishes, furniture tuning, and limited collaboration upgrades.',
 '<svg viewBox="0 0 900 420" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="20" width="860" height="380" fill="#f8fafc" stroke="#0F1F3D" stroke-width="4"/><rect x="50" y="50" width="500" height="250" fill="#dbeafe" stroke="#2563eb"/><rect x="570" y="50" width="280" height="150" fill="#dcfce7" stroke="#16a34a"/><rect x="570" y="220" width="280" height="150" fill="#fef3c7" stroke="#d97706"/><text x="300" y="180" text-anchor="middle" font-size="26" fill="#0F1F3D">Workstations</text><text x="710" y="130" text-anchor="middle" font-size="22" fill="#0F1F3D">Meetings</text><text x="710" y="305" text-anchor="middle" font-size="22" fill="#0F1F3D">Amenities</text></svg>',
 1428000, 1792000, 2184000, 51, 64, 78,
 JSON_OBJECT('construction',JSON_OBJECT('low',560000,'mid',700000,'high',840000),'ffe',JSON_OBJECT('low',420000,'mid',532000,'high',672000),'itAv',JSON_OBJECT('low',196000,'mid',252000,'high',308000),'softCosts',JSON_OBJECT('low',252000,'mid',308000,'high',364000),'tiAllowance',JSON_OBJECT('low',0,'mid',0,'high',0)),
 8, 10, 13,
 JSON_ARRAY(JSON_OBJECT('phase','Discovery and field verification','weeks',1,'description','Verify existing rooms and infrastructure before drawings.'),JSON_OBJECT('phase','Design and pricing','weeks',2,'description','Finish refresh, furniture plan, and contractor pricing.'),JSON_OBJECT('phase','Permits and procurement','weeks',3,'description','Limited permit set and long-lead furniture coordination.'),JSON_OBJECT('phase','Construction and move-in','weeks',4,'description','Phased refresh with minimal demolition.')),
 JSON_OBJECT('headcount',148,'workstations',120,'privateOffices',12,'meetingRooms',9,'phoneRooms',10,'collaborationSeats',32),
 JSON_OBJECT('extractionStatus','diagnostic_seed','confidence',0.74,'narrative','Representative upload context indicates a largely reusable office floor with existing workstation zones, enclosed meeting rooms, and support areas suitable for a low-impact refresh.','qaWarnings',JSON_ARRAY('Diagnostic seed: replace with real uploaded floor plan for acceptance.')),
 JSON_OBJECT('fitScore',86,'headcountCapacity',148,'workstations',118,'privateOffices',10,'meetingRooms',8,'phoneRooms',8,'collaborationSeats',30),
 JSON_ARRAY(JSON_OBJECT('label','Workstations','requested',120,'achieved',118,'status','partial'),JSON_OBJECT('label','Private Offices','requested',12,'achieved',10,'status','partial'),JSON_OBJECT('label','Meeting Rooms','requested',9,'achieved',8,'status','partial'),JSON_OBJECT('label','Phone Rooms','requested',10,'achieved',8,'status','partial')),
 'Reuse approximately 70% of existing room boundaries and workstation infrastructure; concentrate changes in collaboration and acoustic phone-room gaps.',
 JSON_OBJECT('demolition','Minimal selective demolition','newConstruction','Limited partitions for phone rooms','infrastructure','Reuse primary MEP distribution'),
 JSON_ARRAY('Confirm code egress and life-safety with architect of record','Diagnostic report is not acceptance evidence'), 'diagnostic_seed',
 'Best for fast validation and lowest disruption. The program is mostly accommodated, with manageable shortfalls in offices, phone rooms, and meeting capacity that should be confirmed against the actual uploaded plan.'),
(1, 2, 'medium', 'Balanced Reconfiguration', 88, 25760, 28000,
 JSON_ARRAY(JSON_OBJECT('type','Open Workstations','count',126,'sqFt',7560),JSON_OBJECT('type','Private Offices','count',12,'sqFt',1920),JSON_OBJECT('type','Meeting Rooms','count',10,'sqFt',2850),JSON_OBJECT('type','Support / Amenity','count',1,'sqFt',4300)),
 'Rebalances the floor plate by selectively moving enclosed rooms to improve adjacency, add phone rooms, and increase meeting capacity while preserving reusable infrastructure.',
 '<svg viewBox="0 0 900 420" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="20" width="860" height="380" fill="#f8fafc" stroke="#0F1F3D" stroke-width="4"/><rect x="50" y="50" width="420" height="320" fill="#dbeafe" stroke="#2563eb"/><rect x="500" y="50" width="160" height="320" fill="#e0e7ff" stroke="#4f46e5"/><rect x="690" y="50" width="160" height="150" fill="#dcfce7" stroke="#16a34a"/><rect x="690" y="220" width="160" height="150" fill="#fef3c7" stroke="#d97706"/><text x="260" y="220" text-anchor="middle" font-size="24" fill="#0F1F3D">Neighborhoods</text><text x="580" y="220" text-anchor="middle" font-size="18" fill="#0F1F3D">Focus</text><text x="770" y="135" text-anchor="middle" font-size="18" fill="#0F1F3D">Meet</text><text x="770" y="305" text-anchor="middle" font-size="18" fill="#0F1F3D">Cafe</text></svg>',
 2380000, 2996000, 3612000, 85, 107, 129,
 JSON_OBJECT('construction',JSON_OBJECT('low',980000,'mid',1232000,'high',1484000),'ffe',JSON_OBJECT('low',616000,'mid',784000,'high',952000),'itAv',JSON_OBJECT('low',336000,'mid',420000,'high',504000),'softCosts',JSON_OBJECT('low',448000,'mid',560000,'high',672000),'tiAllowance',JSON_OBJECT('low',0,'mid',0,'high',0)),
 13, 16, 20,
 JSON_ARRAY(JSON_OBJECT('phase','Discovery and test fit','weeks',2,'description','Validate existing conditions and finalize program priorities.'),JSON_OBJECT('phase','Schematic / permit documentation','weeks',4,'description','Selective reconfiguration drawings and permit package.'),JSON_OBJECT('phase','Bidding and procurement','weeks',4,'description','Contractor pricing, furniture, and AV procurement.'),JSON_OBJECT('phase','Construction and commissioning','weeks',6,'description','Selective demolition, build-out, furniture install, and punch list.')),
 JSON_OBJECT('headcount',148,'workstations',120,'privateOffices',12,'meetingRooms',9,'phoneRooms',10,'collaborationSeats',32),
 JSON_OBJECT('extractionStatus','diagnostic_seed','confidence',0.78,'narrative','The representative plan context supports selective reconfiguration around the central enclosed-room band and perimeter support zones.','qaWarnings',JSON_ARRAY('Diagnostic seed: replace with real uploaded floor plan for acceptance.')),
 JSON_OBJECT('fitScore',96,'headcountCapacity',154,'workstations',126,'privateOffices',12,'meetingRooms',10,'phoneRooms',10,'collaborationSeats',34),
 JSON_ARRAY(JSON_OBJECT('label','Workstations','requested',120,'achieved',126,'status','met'),JSON_OBJECT('label','Private Offices','requested',12,'achieved',12,'status','met'),JSON_OBJECT('label','Meeting Rooms','requested',9,'achieved',10,'status','met'),JSON_OBJECT('label','Phone Rooms','requested',10,'achieved',10,'status','met')),
 'Reuse base building systems and selected conference rooms while relocating some rooms to create better neighborhoods and more balanced collaboration support.',
 JSON_OBJECT('demolition','Selective removal of interior partitions','newConstruction','New focus rooms and enlarged collaboration zones','infrastructure','Moderate MEP and AV redistribution'),
 JSON_ARRAY('Validate slab penetrations, sprinkler impacts, and landlord rules before pricing'), 'diagnostic_seed',
 'Best MVP demonstration scenario because it visibly satisfies the requested program while showing credible cost, schedule, reuse, and achieved-vs-requested tradeoffs.'),
(1, 3, 'high', 'Full Transformation', 79, 24640, 28000,
 JSON_ARRAY(JSON_OBJECT('type','Open Workstations','count',136,'sqFt',8160),JSON_OBJECT('type','Private Offices','count',14,'sqFt',2240),JSON_OBJECT('type','Meeting Rooms','count',12,'sqFt',3600),JSON_OBJECT('type','Support / Amenity','count',1,'sqFt',5200)),
 'Creates a highly tailored headquarters-style floor with expanded client-facing rooms, improved amenity areas, and a larger collaboration spine at the cost of greater schedule and construction risk.',
 '<svg viewBox="0 0 900 420" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="20" width="860" height="380" fill="#f8fafc" stroke="#0F1F3D" stroke-width="4"/><rect x="50" y="50" width="270" height="320" fill="#dbeafe" stroke="#2563eb"/><rect x="340" y="50" width="220" height="320" fill="#fee2e2" stroke="#dc2626"/><rect x="580" y="50" width="270" height="145" fill="#dcfce7" stroke="#16a34a"/><rect x="580" y="225" width="270" height="145" fill="#fef3c7" stroke="#d97706"/><text x="185" y="220" text-anchor="middle" font-size="20" fill="#0F1F3D">Open Office</text><text x="450" y="220" text-anchor="middle" font-size="20" fill="#0F1F3D">Client Hub</text><text x="715" y="130" text-anchor="middle" font-size="20" fill="#0F1F3D">Team Rooms</text><text x="715" y="305" text-anchor="middle" font-size="20" fill="#0F1F3D">Amenity</text></svg>',
 4060000, 5096000, 6132000, 145, 182, 219,
 JSON_OBJECT('construction',JSON_OBJECT('low',1848000,'mid',2296000,'high',2744000),'ffe',JSON_OBJECT('low',840000,'mid',1064000,'high',1288000),'itAv',JSON_OBJECT('low',560000,'mid',700000,'high',840000),'softCosts',JSON_OBJECT('low',812000,'mid',1036000,'high',1260000),'tiAllowance',JSON_OBJECT('low',0,'mid',0,'high',0)),
 22, 27, 33,
 JSON_ARRAY(JSON_OBJECT('phase','Programming and due diligence','weeks',3,'description','Detailed field verification and stakeholder programming.'),JSON_OBJECT('phase','Design development and permits','weeks',8,'description','Full permit drawings, engineering, and landlord review.'),JSON_OBJECT('phase','Bidding and procurement','weeks',6,'description','Competitive bidding and procurement of long-lead scopes.'),JSON_OBJECT('phase','Construction and commissioning','weeks',10,'description','Major demolition, build-out, inspections, and move-in.')),
 JSON_OBJECT('headcount',148,'workstations',120,'privateOffices',12,'meetingRooms',9,'phoneRooms',10,'collaborationSeats',32),
 JSON_OBJECT('extractionStatus','diagnostic_seed','confidence',0.71,'narrative','Representative plan context can support a transformation, but most existing enclosed-room logic would be replaced, increasing validation and construction risk.','qaWarnings',JSON_ARRAY('Diagnostic seed: replace with real uploaded floor plan for acceptance.')),
 JSON_OBJECT('fitScore',92,'headcountCapacity',162,'workstations',136,'privateOffices',14,'meetingRooms',12,'phoneRooms',12,'collaborationSeats',42),
 JSON_ARRAY(JSON_OBJECT('label','Workstations','requested',120,'achieved',136,'status','met'),JSON_OBJECT('label','Private Offices','requested',12,'achieved',14,'status','met'),JSON_OBJECT('label','Meeting Rooms','requested',9,'achieved',12,'status','met'),JSON_OBJECT('label','Phone Rooms','requested',10,'achieved',12,'status','met')),
 'Reuse only perimeter constraints and major service cores; rebuild most interior planning logic for a branded headquarters experience.',
 JSON_OBJECT('demolition','Substantial interior demolition','newConstruction','New client suite, meeting center, and amenity spine','infrastructure','Significant MEP, AV, lighting, and furniture replacement'),
 JSON_ARRAY('Highest cost and schedule risk; requires architectural and engineering validation'), 'diagnostic_seed',
 'Best for a premium headquarters vision. It exceeds several requested counts but should be weighed against the much higher cost, longer schedule, and lower reuse percentage.');
