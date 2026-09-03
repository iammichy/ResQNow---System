// src/i18n/locales/en.js

const en = {
  // ============ COMMON ============
  common: {
    home: 'Home',
    track: 'Track',
    report: 'Report',
    contacts: 'Contacts',
    updates: 'Updates',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    edit: 'Edit',
    back: 'Back',
    call: 'Call',
    callNow: 'Call Now',
    optional: 'Optional',
    required: 'Required',
    yes: 'Yes',
    no: 'No',
    submit: 'Submit',
    confirm: 'Confirm',
    loading: 'Loading...',
  },

  // ============ NAVIGATION ============
  nav: {
    home: 'Home',
    track: 'Track',
    report: 'Report',
    contacts: 'Contacts',
    updates: 'Updates',
  },

  // ============ DASHBOARD ============
  dashboard: {
    greeting: 'Hello, {{name}}',
    importantUpdates: 'Important Updates',
    myReports: 'My Reports',
    latestReport: 'Latest Report',
    recentReports: 'Recent Reports',
    safetyPreparedness: 'Safety & Preparedness',
    active: 'Active',
    pending: 'Pending',
    resolved: 'Resolved',
    viewAll: 'View All',
    viewReport: 'View Report',
    safetyTips: 'Safety Tips',
  },

  // ============ SUBMIT REPORT ============
  submitChoice: {
    title: 'Submit a Report',
    subtitle: 'Choose the type of report you want to send.',

    emergencyTitle: 'Emergency',
    emergencyDescription:
      'For situations that require immediate barangay or emergency response.',

    nonEmergencyTitle: 'Non-Emergency',
    nonEmergencyDescription:
      'For barangay concerns, assistance requests, and non-urgent reports.',
  },

  // ============ EMERGENCY REPORT ============
  emergency: {
    title: 'Emergency Report',
    question: 'What is the emergency?',

    locationQuestion: 'Where is the emergency?',
    currentLocationHint: 'This will use your current location.',
    otherLocationHint:
      'The emergency may not be at your location. Set where it is actually happening.',

    useCurrentLocation: 'Use Current Location',
    atCurrentLocation: 'Emergency is at my current location',
    manualLocation: 'Enter location manually',
    somewhereElse: 'Emergency is somewhere else',
    useCurrentInstead: 'Use my current location instead',

    reportingForOther: 'Reporting for someone else?',
    reportingForOtherHint: 'Tap if the emergency is for another person.',
    addVictimDetails: "Add the victim's details below.",

    victimName: 'Victim Name',
    victimContact: 'Victim Contact',
    unknownName: "I don't know the name",

    reporterInfo:
      'Your name, contact, and purok will be sent automatically.',

    optionalDetails: 'Optional Details',
    optionalDetailsHint: 'Landmark & short description',
    nearbyLandmark: 'Nearby Landmark',
    nearbyLandmarkPlaceholder: 'Example: Near the covered court',
    shortDescription: 'Short Description',
    shortDescriptionPlaceholder:
      'Briefly describe what is happening...',

    weakSignal: 'Weak signal?',
    weakSignalMessage: 'Call the hotline directly.',
    viewContacts: 'View Contacts',

    send: 'Send Emergency Report',
    confirmTitle: 'Confirm Emergency Report',
    confirmMessage:
      'Send now? Your name, contact number, address, and location will be sent to barangay personnel.',
    sendNow: 'Send Now',
    sending: 'Sending...',

    selectTypeError: 'Please select the type of emergency.',
    locationError:
      'Please set your location so responders know where to go.',

    submittedTitle: 'Emergency Report Submitted',
    submittedMessage:
      'Your report is ready for barangay personnel to review and respond.',
    reportId: 'Report ID',
    reporter: 'Reporter',
    location: 'Location',
    status: 'Status',
    backHome: 'Back to Home',
    submitAnother: 'Submit Another Report',

    categories: {
      lifeDeath: {
        label: 'Life-Threatening',
        description: "Someone's life is in immediate danger.",
      },

      fire: {
        label: 'Fire Emergency',
        description:
          'Active fire, heavy smoke, or immediate fire danger.',
      },

      medical: {
        label: 'Medical Emergency',
        description:
          'Serious injury, illness, or urgent medical help.',
      },

      violence: {
        label: 'Violence / Safety Threat',
        description:
          'Violence, threats, or immediate danger from another person.',
      },

      flood: {
        label: 'Flood Rescue',
        description:
          'Urgent rescue or assistance because of flooding.',
      },

      accident: {
        label: 'Road Accident',
        description:
          'Vehicle crash or serious road-related accident.',
      },

      evacuation: {
        label: 'Urgent Evacuation',
        description:
          'Immediate help is needed to evacuate safely.',
      },
    },
  },

  // ============ NON-EMERGENCY REPORT ============
  nonEmergency: {
    title: 'Non-Emergency Report',
    subtitle: 'Report a barangay concern or request assistance.',

    reportingFor: 'Who is this report for?',
    reportingForHint:
      'Tell us who may need the barangay assistance.',

    myself: 'Myself',
    anotherPerson: 'Another Person',
    name: 'Name',
    contactNumber: 'Contact Number',
    relationship: 'Relationship / Note',

    concernQuestion: 'What is your concern?',
    concernInstruction:
      'Select the category that best matches your report.',

    specifyConcern: 'Specify the concern',
    optional: 'optional',

    evacuationWarning:
      'In danger right now? Use Emergency Report → Urgent Evacuation instead.',

    incidentLocation: 'Incident Location',
    setIncidentLocation: 'Set where the concern is located',
    purok: 'Purok',
    addressLocation: 'Address / Incident Location',
    nearbyLandmark: 'Nearby Landmark',
    pinIncidentLocation: 'Pin Incident Location',
    mapLater: 'Map pin integration will be connected later.',

    reportDetails: 'Report Details',
    reportDetailsHint:
      'Give enough information for barangay personnel to review the concern.',

    description: 'Description',
    descriptionPlaceholder: 'Describe the concern briefly...',

    assistanceNeeded: 'Assistance Needed',
    assistancePlaceholder:
      'Example: Clean-up crew, transportation, repair...',

    affectedIndividuals: 'Affected Individuals',
    affectedHint: 'Select all that apply. Optional.',

    affected: {
      child: 'Child',
      seniorCitizen: 'Senior Citizen',
      pwd: 'PWD',
      pregnantPerson: 'Pregnant Person',
      injuredPerson: 'Injured Person',
    },

    photoEvidence: 'Photo Evidence',
    photoOptional: 'Optional only.',
    addPhoto: 'Add Photo',
    photoType: 'JPG or PNG',

    reporterInfo:
      'Your name, contact number, address, and purok will be included automatically with this report.',

    reviewReport: 'Review Report',
    pendingNotice:
      'Non-emergency reports will start as Pending Verification.',

    confirmTitle: 'Confirm Report',
    confirmHint:
      'Review the important details before submitting.',
    concernType: 'Concern Type',
    reportingForLabel: 'Reporting For',
    person: 'Person',
    status: 'Status',
    goBack: 'Go Back',
    confirmSubmit: 'Confirm & Submit',
    submitting: 'Submitting...',

    selectTypeError: 'Please select a concern type.',
    locationError: 'Please provide the incident location.',
    descriptionError:
      'Please add a short description of the concern.',

    submittedTitle: 'Report Submitted',
    submittedMessage:
      'Your concern has been submitted and is waiting for barangay verification.',
    reportId: 'Report ID',
    viewReports: 'View My Reports',
    backHome: 'Back to Home',

    categories: {
      evacuation: {
        label: 'Evacuation Help',
        description:
          'Non-urgent help preparing for or getting to an evacuation center.',
      },

      healthWorker: {
        label: 'Health Worker Assistance',
        description:
          'Request a BHW visit, health check, or basic health assistance.',
      },

      roadObstruction: {
        label: 'Blocked Road / Obstruction',
        description:
          'Tree, debris, vehicle, or object is blocking a road or pathway.',
      },

      damagedFacility: {
        label: 'Damaged Public Facility',
        description:
          'Damaged streetlight, road, drainage, or barangay facility.',
      },

      cleanup: {
        label: 'Community Clean-Up',
        description:
          'Waste, branches, or scattered debris needs barangay clean-up.',
      },

      community: {
        label: 'Community Concern',
        description:
          'Sanitation, noise, stray animals, or other neighborhood concerns.',
      },

      other: {
        label: 'Other Barangay Assistance',
        description:
          'Request barangay help that does not fit the categories above.',
      },
    },
  },

  // ============ TRACK REPORTS ============
  track: {
    title: 'Track Reports',
    subtitle: 'View and monitor your submitted reports.',

    searchPlaceholder: 'Search report ID or concern...',
    all: 'All',
    emergency: 'Emergency',
    nonEmergency: 'Non-Emergency',

    active: 'Active',
    resolved: 'Resolved',

    reportId: 'Report ID',
    type: 'Type',
    concern: 'Concern',
    location: 'Location',
    status: 'Status',
    date: 'Date',
    latestUpdate: 'Latest Update',

    noReports: 'No reports found.',
  },

  // ============ REPORT DETAIL ============
  reportDetail: {
    title: 'Report Details',
    currentStatus: 'Current Status',
    latestUpdate: 'Latest Update',
    resolutionRemarks: 'Resolution Remarks',

    progress: 'Report Progress',
    assignedPersonnel: 'Assigned Personnel',
    location: 'Location',
    reportInformation: 'Report Information',

    barangayRemarks: 'Barangay Remarks',
    invalidReason: 'Invalid Reason',

    reportType: 'Report Type',
    concernType: 'Concern Type',
    subcategory: 'Subcategory',
    submitted: 'Submitted',
    updated: 'Updated',

    victimInformation: 'Victim Information',
    affectedIndividuals: 'Affected Individuals',
  },

  // ============ CONTACTS ============
  contacts: {
    title: 'Emergency Contacts',
    subtitle:
      'Barangay contacts, emergency services, and important locations.',

    barangayHotline: 'Barangay Hotline',
    callBarangayHotline: 'Call Barangay Hotline',

    officials: 'Barangay Officials & Personnel',
    officialsDescription:
      'Captain, Kagawads, SK, Secretary, Treasurer and personnel',

    contactDirectory: 'Contact Directory',
    tapCardCall: 'Tap a card to call',

    emergencyLocations: 'Emergency Locations',
    emergencyLocationsHint:
      'Barangay and nearby emergency facilities.',

    selectLocation: 'Select a location',
    selectLocationHint: 'Tap one of the locations below.',
    mapLater: 'Map integration will be connected later.',

    lguServices: 'LGU & Emergency Services',
    lguHint: 'Tap a service to call.',

    fire: 'Fire',
    police: 'Police',
    medical: 'Medical',
    rescue: 'Rescue',
  },

  // ============ UPDATES ============
  updates: {
    title: 'Updates',
    subtitle:
      'Barangay announcements, alerts, and report updates.',

    all: 'All',
    alerts: 'Alerts',
    announcements: 'Announcements',
    myReports: 'My Reports',

    read: 'Read',
    unread: 'Unread',
    expired: 'Expired',

    noUpdates: 'No updates available.',
  },

  // ============ SAFETY TIPS ============
  safetyTips: {
    title: 'Safety Tips',
    subtitle:
      'Preparedness and safety guides for emergencies and community concerns.',

    emergencySafety: 'Emergency Safety',
    communitySafety: 'Community & Non-Emergency Safety',
  },

  // ============ SETTINGS ============
  settings: {
    title: 'Profile & Settings',
    subtitle:
      'Manage your resident information and account preferences.',

    verifiedResident: 'Verified Resident',

    personalHousehold: 'Personal & Household',
    personalHouseholdHint:
      'Profile, address and household information',

    residentInformation: 'Resident Information',
    fullName: 'Full Name',
    contactNumber: 'Contact Number',
    email: 'Email',
    address: 'Address',
    purok: 'Purok',

    homeLocation: 'Home Location',
    savedHomeLocation: 'Saved Home Location',
    mapLater: 'Map pin integration will be connected later.',

    householdInformation: 'Household Information',
    householdMembers: 'Household Members',
    householdMembersHint: 'Total people in your household',
    householdProfile: 'Household Profile',

    seniorCitizen: 'Senior Citizen',
    child: 'Child',
    pwd: 'PWD',
    pregnantPerson: 'Pregnant Person',

    edit: 'Edit',
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    profileUpdated: 'Profile updated successfully.',

    security: 'Account & Security',
    securityHint: 'Change your account password',

    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm New Password',

    showPasswords: 'Show passwords',
    hidePasswords: 'Hide passwords',

    passwordRequirements: 'Password requirements',
    passwordRequirementsText:
      'At least 8 characters with an uppercase letter, number, and special character.',

    changePassword: 'Change Password',
    passwordUpdated: 'Password updated successfully.',

    preferences: 'Preferences',
    preferencesHint: 'Language and notification settings',

    language: 'Language',

    languages: {
      en: 'English',
      tl: 'Tagalog',
      ilo: 'Ilocano',
      ibg: 'Ibanag (Ybanag)',
    },

    notifications: 'Notifications',

    reportUpdates: 'Report Updates',
    reportUpdatesHint: 'Status and responder updates',

    announcements: 'Announcements',
    announcementsHint: 'Barangay news and advisories',

    emergencyAlerts: 'Emergency Alerts',
    emergencyAlertsHint:
      'Critical safety and evacuation alerts',

    savePreferences: 'Save Preferences',
    preferencesSaved: 'Preferences saved.',

    privacy: 'Privacy & Data',
    privacyHint: 'How your resident information is used',

    residentDataPrivacy: 'Resident Data Privacy',

    privacyMessage:
      'Your personal information is used to identify your account, verify reports, contact you when necessary, and help barangay personnel respond to requests and emergencies.',

    privacyDetails:
      'Report information such as your name, contact number, location, and submitted details may be shared with authorized barangay or emergency personnel when needed for response and coordination.',

    signOut: 'Sign Out',
    residentId: 'Resident ID',
  },

  // ============ REPORT STATUS ============
  status: {
    submitted: 'Submitted',
    pendingVerification: 'Pending Verification',
    verified: 'Verified',
    inProgress: 'In Progress',
    respondersEnRoute: 'Responders En Route',
    responded: 'Responded',
    resolved: 'Resolved',
    invalid: 'Invalid',
  },
};

export default en;