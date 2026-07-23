// ============================================================================
// Legal Data Structures & Constants (Privacy Policy & Terms of Use)
// ============================================================================

export interface LegalSectionContent {
  subtitle: string;
  text: string;
}

export interface LegalSection {
  id: string;
  num: string;
  title: string;
  iconName: string;
  summary: string;
  content: LegalSectionContent[];
}

// Privacy Policy Sections Database
export const PRIVACY_POLICY_SECTIONS: LegalSection[] = [
  {
    id: 'lawful-basis',
    num: '01',
    title: 'Lawful Basis for Collecting & Processing Data',
    iconName: 'Scale',
    summary: 'Our processing operations adhere strictly to legal grounds recognized under the Nigeria Data Protection Act 2023 (NDPA 2023).',
    content: [
      {
        subtitle: 'Consent',
        text: 'Where you have consented to our processing of your personal data for one or more specific reasons. Such consent is given by you through your continuous use of the Services and the Sites. Consent may be obtained through affirmative actions such as ticking a consent box, signing a consent form, or submitting information voluntarily for a specific service.'
      },
      {
        subtitle: 'Performance of a Contract',
        text: 'In order to perform a contract we have with you or a contract to which you are a party to, and in order to take necessary steps at your request prior to entering into such a contract (such as booking jet charters, hangar leases, or FBO ground handling).'
      },
      {
        subtitle: 'Legal Obligation',
        text: 'Where processing of personal data is required by law. For instance, we are required by law to retain personal data of our customers beyond the date such customers cease to carry on business with us to comply with civil aviation regulations and anti-money laundering frameworks.'
      },
      {
        subtitle: 'Vital Interest',
        text: 'In order to process data for data subjects when they are in critical life-threatening situations where they may not be able to provide consent for data processing and which may be vital for the subjects’ survival (e.g. emergency medical evacuations or airside safety incidents).'
      },
      {
        subtitle: 'Public Interest',
        text: 'Such processing is necessary for the performance of a task carried out in the interest of the public or in exercise of an official public mandate vested on us by relevant civil aviation and national security authorities.'
      }
    ]
  },
  {
    id: 'data-collected',
    num: '02',
    title: 'Information We May Collect From You',
    iconName: 'Database',
    summary: 'We collect personal data necessary to deliver executive aviation, FBO, maintenance, and flight operations safely.',
    content: [
      {
        subtitle: 'Definition of Personal Data',
        text: 'Personal data/information in this context shall include all data relating to an identified or identifiable natural person who can be identified directly or indirectly by: name, identification number, location data, online identifier, address, photo, email address, posts on social networking websites, account and login details, financial and transactional information (payment card details, billing address, transaction history), flight details, travel itineraries, emergency contact information, passenger manifest data, aircraft ownership or operation details, health or medical details, and other unique identifiers such as MAC address, IP address, IMEI number, IMSI number, or SIM.'
      },
      {
        subtitle: 'Specific Services Data Requirements',
        text: 'For the purpose of accessing our Services, the personal data we may collect includes: your full legal names, marital status, title, date of birth, gender, photo, facial recognition data, business name, email address, mailing address, telephone number, bank account number, payment card details, bank verification number (BVN), national identification number (NIN), international passport number, means of identification, guarantors contact details, bank statements, usernames, password, your preferences, interests, feedback and survey responses, preference in receiving marketing information from us and our third parties, and your communication preferences.'
      },
      {
        subtitle: 'Primary Purpose of Collection',
        text: 'Our primary goal in collecting the above stated personal data is to provide you with a safe, efficient, smooth and customized executive aviation experience. This allows us to provide services and features that most likely meet your operational and luxury travel needs.'
      }
    ]
  },
  {
    id: 'how-collected',
    num: '03',
    title: 'How We Collect Information',
    iconName: 'Eye',
    summary: 'Data is gathered through direct digital channels, facility visits, technical tracking, and authorized screening partners.',
    content: [
      {
        subtitle: 'Direct Interactions',
        text: 'We collect information you provide directly to us—for example, when you register or log on to the Sites, create an account, subscribe to a Service, participate in interactive features, fill out a form, take part in surveys, post on message boards, upload documentation, request customer support, make an inquiry, communicate with us by email, phone, or post, or interact on social media.'
      },
      {
        subtitle: 'Incomplete & Abandoned Forms',
        text: 'We will also collect your information where you partially complete and/or abandon any information inputted in the Sites and may use this information to contact you to remind you to complete any outstanding information.'
      },
      {
        subtitle: 'Offline Aviation Operations',
        text: 'We may collect personal data offline in the course of providing aviation-related services, such as when passengers or clients visit our FBO facilities, complete check-in or access procedures, or participate in safety, security, and compliance checks at Murtala Muhammed International Airport (MMIA).'
      },
      {
        subtitle: 'Automated Technologies & Server Logs',
        text: 'Every computer connected to the internet is given a domain name and an IP address. When you use the Sites, our web servers automatically recognize your domain name and IP address. This reveals technical browsing patterns and equipment data through cookies, server logs, and similar technologies. You can adjust your preferences via our cookie settings.'
      },
      {
        subtitle: 'Third Parties & Public Sources',
        text: 'We may collect technical data from third parties/public sources such as analytics providers, identity verification providers, advertising networks, and search information providers. We may obtain contact, financial, and transaction data from providers of technical, payment, credit referencing, and delivery services based both inside and outside Nigeria. We also utilize third-party service providers to secure information related to financial crime, fraud, sanctions, and politically exposed persons (PEPs).'
      },
      {
        subtitle: 'Data Protection Safeguards',
        text: 'We do not own personal data provided and will only store such data for a period reasonably needed. We will do our best to ensure that such personal data is secured against all foreseeable hazards and breaches such as theft, cyber-attack, viral attack, unauthorized dissemination, manipulation, rain, fire, or exposure to natural elements.'
      }
    ]
  },
  {
    id: 'other-sources',
    num: '04',
    title: 'Information We Collect From Other Sources',
    iconName: 'Globe2',
    summary: 'Combining internal data with verified external application records to maintain service quality.',
    content: [
      {
        subtitle: 'External Integration',
        text: 'In order to provide you with access to the Services, or to provide you with better service in general, we may combine information obtained from other sources (for example, a third-party developer whose application you have authorized) and combine that with information we collect through the Sites.'
      }
    ]
  },
  {
    id: 'how-used',
    num: '05',
    title: 'How We Use Your Personal Data',
    iconName: 'FileCheck',
    summary: 'We utilize your data strictly to deliver seamless flight operations, security compliance, and customized support.',
    content: [
      {
        subtitle: 'Operational & Service Delivery Purposes',
        text: 'We use your personal data to respond to inquiries and fulfill requests; process transactions and send transaction notices; verify your identity; resolve disputes and troubleshoot problems; improve services via customer preferences; manage and protect IT infrastructure; monitor traffic patterns to improve site design; record and store communications via phone, Skype, or chat; personalize your experience; send technical notices, updates, security alerts, and support messages; poll opinions through surveys; facilitate flight operations, passenger and crew management, and travel documentation; comply with aviation safety and security requirements; and communicate flight updates or operational notices.'
      },
      {
        subtitle: 'Legal & Protection Compliance',
        text: 'We use data as EAN believes necessary or appropriate: to comply with a legal obligation under civil aviation law; to protect EAN’s legitimate interests, privacy, property, or safety (and those of third parties, provided your rights do not override those interests); and to protect your vital interests.'
      },
      {
        subtitle: 'Communication Monitoring & Anonymization',
        text: 'We may monitor and record our communications with you, including emails and phone conversations, for training, quality assurance, and legal/regulatory compliance. Whenever we use information for legitimate interests, we ensure data is processed on an anonymized and aggregated basis that cannot be linked to any living individual.'
      }
    ]
  },
  {
    id: 'data-subject-rights',
    num: '06',
    title: 'Your Rights as a Data Subject',
    iconName: 'UserCheck',
    summary: 'Enshrined in the Nigeria Data Protection Act 2023 (NDPA 2023), giving you full control over your personal information.',
    content: [
      {
        subtitle: 'Legal Rights Overview',
        text: 'Under Data Protection Laws, you possess the following rights: (1) Right to be informed whether EAN or its processors are storing or processing your data; (2) Right to request a copy of your personal data in a commonly used electronic format; (3) Right to correction or deletion of inaccurate, out-of-date, incomplete, or misleading data; (4) Right for erasure of personal data without undue delay; (5) Right to withdraw consent at any time; (6) Right to object to processing; (7) Right to object to automated decision-making and profiling; (8) Right to data portability; and (9) Right to lodge a complaint with the Nigeria Data Protection Commission (NDPC).'
      },
      {
        subtitle: 'Fees & Procedure for Exercising Rights',
        text: 'Requesting copies of your personal data is generally free. However, a reasonable fee may be charged if requests are manifestly unfounded or excessive. To exercise your rights, submit your request in writing via registered email to info@ean.aero or use our Data Subject Access Request (DSAR) portal on our website.'
      },
      {
        subtitle: 'Response SLA Window',
        text: 'We endeavor to process all subject access requests within thirty (30) days. If an extension is required due to complexity, we will communicate this through your consented channels at no cost. You may continue receiving standard operational notices during a brief transitional updating period.'
      }
    ]
  },
  {
    id: 'retention',
    num: '07',
    title: 'Retention of Your Data',
    iconName: 'Clock',
    summary: 'Data is kept only as long as necessary for flight services, legal mandates, and PCI DSS compliance.',
    content: [
      {
        subtitle: 'Retention Principles',
        text: 'We will not retain your personal data longer than necessary for the purposes for which it is processed. When calculating appropriate retention periods, we evaluate the sensitivity of the data, the processing purpose, and statutory requirements.'
      },
      {
        subtitle: 'PCIDSS 10-Year Obligation',
        text: 'Under our Payment Card Industry Data Security Standard (PCIDSS) obligation, we are legally required to retain customer personal data for a minimum of ten (10) years from the end date of our business relationship with you.'
      },
      {
        subtitle: 'Secure Disposal Procedure',
        text: 'When personal data reaches the end of its retention timeline or upon a valid erasure request under Data Protection Laws, we ensure the data is securely deleted, anonymized, or destroyed.'
      }
    ]
  },
  {
    id: 'accuracy',
    num: '08',
    title: 'Accuracy of Your Data',
    iconName: 'RefreshCw',
    summary: 'Maintaining current and accurate data is essential for aviation passenger clearance and service execution.',
    content: [
      {
        subtitle: 'Keeping Data Current',
        text: 'It is important that the personal data EAN holds about you is accurate and current. Please inform EAN if your details change during our relationship. You can easily update your profile through customer-facing portals or by contacting our Data Protection Officer.'
      }
    ]
  },
  {
    id: 'security',
    num: '09',
    title: 'Security of Your Data',
    iconName: 'Lock',
    summary: 'Industrial-grade encryption, isolated server infrastructure, and proactive breach protocols protect your records.',
    content: [
      {
        subtitle: 'Technical & Organizational Safeguards',
        text: 'We store data on dedicated and secure servers with at least 256-bit encryption. Access is strictly restricted to authorized employees. We enforce robust IT security systems and breach response procedures.'
      },
      {
        subtitle: 'Data Breach Notification Protocol',
        text: 'In the unlikely event of a data breach, EAN will take immediate mitigating action and, where appropriate, notify you and the Nigeria Data Protection Commission (NDPC) without delay.'
      },
      {
        subtitle: 'Account Credentials & User Responsibility',
        text: 'You assume full responsibility for maintaining the confidentiality of your password and credentials. You must never share your password or allow third-party access to your account.'
      }
    ]
  },
  {
    id: 'data-transfers',
    num: '10',
    title: 'Data Transfers & Sharing',
    iconName: 'Share2',
    summary: 'Cross-border data transfers adhere strictly to international aviation frameworks and NDPA regulations.',
    content: [
      {
        subtitle: 'Regulatory & Mandatory Disclosures',
        text: 'Operating in a regulated aviation environment means private communications and identifiable information may be disclosed to governments, regulatory bodies, civil aviation authorities, and law enforcement in the public interest.'
      },
      {
        subtitle: 'Third-Party Service Providers',
        text: 'We share data with trusted third parties for site maintenance, identity validation, analytics, IT software, and regulatory compliance. We may also share aggregated non-identifiable statistics with partners and advertisers.'
      },
      {
        subtitle: 'Cross-Border International Transfers',
        text: 'When personal data is transferred outside Nigeria (to international service providers, flight authorities, or cloud systems), we ensure full compliance with Data Protection Laws, international frameworks, and treaties.'
      }
    ]
  },
  {
    id: 'cookies',
    num: '11',
    title: 'Cookies Policy',
    iconName: 'Cookie',
    summary: 'Cookies enhance browsing experience, secure sessions, and customize operational features.',
    content: [
      {
        subtitle: 'Types of Cookies Used',
        text: '(1) Necessary Cookies: Essential for website functionality and security (cannot be disabled). (2) Performance & Analytics Cookies: Help analyze site performance and traffic patterns. (3) Advertising & Targeting Cookies: Deliver tailored promotions and content.'
      },
      {
        subtitle: 'Purpose & Control',
        text: 'Cookies are used for personalization, security, analytics, and functionality. You can manage, disable, or delete cookies at any time through your browser settings.'
      }
    ]
  },
  {
    id: 'policy-updates',
    num: '12',
    title: 'Updates to the Privacy Policy',
    iconName: 'RefreshCw',
    summary: 'Periodic reviews ensure alignment with evolving data protection laws and technological standards.',
    content: [
      {
        subtitle: 'Policy Revision Notice',
        text: 'We reserve the right to update this Policy as needed. Material changes will be communicated via website notices or email. Your continued use of the Sites signifies acceptance of updated terms.'
      }
    ]
  },
  {
    id: 'contact-dpo',
    num: '13',
    title: 'Contact Information & DPO',
    iconName: 'Mail',
    summary: 'Our dedicated Data Protection Officer handles all inquiries, privacy concerns, and DSAR requests.',
    content: [
      {
        subtitle: 'Data Protection Officer (DPO) Details',
        text: 'If you have questions or wish to exercise your rights under the Nigeria Data Protection Act 2023, please contact our DPO using the official channels below.'
      }
    ]
  }
];

// Terms of Use Sections Database
export const TERMS_OF_USE_SECTIONS: LegalSection[] = [
  {
    id: 'acceptance',
    num: '01',
    title: 'Acceptance of Terms and Conditions',
    iconName: 'Scale',
    summary: 'Governs your use of https://ean.aero/ owned and operated by EAN Aviation Limited. Use indicates full agreement to these Terms and Privacy Policy.',
    content: [
      {
        subtitle: 'Agreement & Scope',
        text: 'This Website Terms of Use Agreement governs your use of the website located at https://ean.aero/ (the “Site”) which is owned and operated by EAN Aviation Limited (the “EAN Group,” “we,” “us” or “our”).'
      },
      {
        subtitle: 'Binding Acceptance & Privacy Policy',
        text: 'BY ACCESSING, BROWSING OR USING THE SITE OR ANY PAGES OF THE SITE, YOU ARE INDICATING THAT YOU HAVE READ AND ACKNOWLEDGE AND AGREE TO BE BOUND BY THIS WEBSITE TERMS OF USE AGREEMENT (COLLECTIVELY, “TERMS AND CONDITIONS”), AND THE EAN GROUP’S WEBSITE PRIVACY POLICY LOCATED AT https://ean.aero/privacy-policy/. IF YOU DO NOT AGREE TO EVERY PROVISION OF THESE TERMS AND CONDITIONS AND THE EAN GROUP’S WEBSITE PRIVACY POLICY, PLEASE DO NOT ACCESS, BROWSE OR USE THE SITE.'
      },
      {
        subtitle: 'Age & Legal Capacity',
        text: 'BY ACCEPTING THESE TERMS AND CONDITIONS, YOU REPRESENT AND WARRANT THAT YOU ARE 18 YEARS OF AGE OR OLDER AND THAT, IF YOU HAVE ACCEPTED THESE TERMS AND CONDITIONS ON BEHALF OF ANY BUSINESS (SUCH AS A CORPORATION, PARTNERSHIP, LIMITED LIABILITY EAN GROUP OR OTHER ORGANIZATION) OR OTHER ENTITY, YOU REPRESENT AND WARRANT THAT YOU HAVE LEGAL AUTHORITY TO DO SO.'
      }
    ]
  },
  {
    id: 'revisions',
    num: '02',
    title: 'Revisions to these Terms and Conditions',
    iconName: 'RefreshCw',
    summary: 'Terms may be updated at any time. The "Last Updated" legend specifies the effective date of the latest update.',
    content: [
      {
        subtitle: 'Modification Right & Notice',
        text: 'These Terms and Conditions may be revised at any time for any reason, and we may provide you notice of these changes by any reasonable means, including by posting the revised version of the Terms and Conditions on the Site.'
      },
      {
        subtitle: 'Last Updated Legend & Effective Date',
        text: 'You can determine when we last updated these Terms and Conditions by referring to the “Last Updated” legend in the Terms and Conditions, which shall clearly specify the effective date of the most recent update. By accessing, browsing or using the Site following the posting of changes to these Terms and Conditions, you accept such changes.'
      },
      {
        subtitle: 'Continuous Acceptance & Lawful Use',
        text: 'You agree to use the Site for lawful purposes only in a manner consistent with any and all applicable rules, laws and regulations. Any use of the Site in a manner inconsistent with these Terms and Conditions is deemed unauthorized access and may subject the user to civil or criminal penalties. We strongly recommend that you periodically visit this page of the Site to review these Terms and Conditions.'
      }
    ]
  },
  {
    id: 'site-content',
    num: '03',
    title: 'Use of Site; Site Content',
    iconName: 'FileText',
    summary: 'All text, graphics, designs, coding, and reports are owned by EAN Group or third parties and protected under intellectual property laws.',
    content: [
      {
        subtitle: 'Ownership of Site Content',
        text: 'Your use of the Site is subject in all respects to these Terms and Conditions. The Site and all material on the Site or contained therein, all text, graphics, and other works on the Site, the Site’s design and coding, all computer programs used and licensed in connection with the Site, the look and feel of the Site, and all data and reports generated by the Site (collectively, the “Site Content”) are owned by us or a third-party. These materials are protected under copyright, trademark and other laws.'
      },
      {
        subtitle: 'Restrictions on Exploitation',
        text: 'You may not copy, download, transmit, modify, distribute or republish the Site or any portion of the Site, including without limitation any of the Site Content without the prior written consent of EAN Group. You may not sell, publicly display, create derivative works of, reverse engineer, assign, sub-license, transfer or otherwise exploit the Site or any Content. Use of any Site Content is prohibited without the prior written permission of EAN Group.'
      }
    ]
  },
  {
    id: 'linked-sites',
    num: '04',
    title: 'Linked Sites',
    iconName: 'Globe2',
    summary: 'Third-party websites linked on our site are provided for convenience only and do not constitute an endorsement by EAN Group.',
    content: [
      {
        subtitle: 'Third-Party Content Disclaimer',
        text: 'EAN Group has not reviewed all of the websites linked to the Site and is not responsible for the content of any third-party pages or any other websites linked to the Site.'
      },
      {
        subtitle: 'No Endorsement Implied',
        text: 'Nothing in the Site, including, without limitation, any links to other websites, should be construed as an endorsement of any products, services or information of any other persons or companies by EAN Group.'
      },
      {
        subtitle: 'User Risk & Link Management',
        text: 'Your choice to link to any other website is at your own risk, and you agree to comply with all terms and conditions relating to such websites. EAN Group reserves the right not to link, or to remove the link, to a particular website at any time. Any links to third party websites are provided as a convenience to you and are neither owned nor operated by EAN Group. EAN Group has no control over these linked websites and makes no representations or warranties with respect to these linked websites. Your viewing and use of any third party websites is at your sole discretion and risk.'
      }
    ]
  },
  {
    id: 'mobile-use',
    num: '05',
    title: 'Use of Site from Mobile Devices',
    iconName: 'Smartphone',
    summary: 'Mobile users are responsible for carrier airtime, data fees, and network coverage availability.',
    content: [
      {
        subtitle: 'Carrier Fees & Service Availability',
        text: 'If you use the Site on a mobile device, you acknowledge that your mobile carrier may bill you applicable airtime, data, and usage fees and taxes for your use of the Site. Check your mobile carrier’s wireless plan for full details. Service may not be available in all areas.'
      }
    ]
  },
  {
    id: 'trademarks',
    num: '06',
    title: 'EAN Group Trademarks',
    iconName: 'Award',
    summary: 'All logos, trademarks, and service marks on the Site belong to EAN Group or third parties and may not be used without written authorization.',
    content: [
      {
        subtitle: 'Ownership of Trademarks',
        text: 'All product and service names appearing in a typeface different from that of the surrounding text or with a trademark symbol, and the EAN Group logos, are registered and unregistered trademarks and service marks owned by EAN Group or its subsidiaries or affiliates or a third party. The absence of a name, trademark or logo in this list does not constitute a waiver of any and all intellectual property rights that EAN Group has established in any of its goods, services, names or logos.'
      },
      {
        subtitle: 'Prohibition of Misuse',
        text: 'These trademarks and all other trademarks, service marks, logos, and EAN Group names (each a “Mark”) used in connection with the Site are the property of EAN Group or third parties and shall remain the property of EAN Group and such third-parties. Nothing contained in the Site shall be construed as granting, by implication or otherwise, any license or right to use any such Mark without the prior written permission of EAN Group or such third-party that may own such Mark. Your misuse of any such Mark, or any other Site Content, is strictly prohibited.'
      }
    ]
  },
  {
    id: 'legal-requirements',
    num: '07',
    title: 'Legal Requirements',
    iconName: 'ShieldAlert',
    summary: 'EAN Group may disclose IP addresses or personal information where required by legal process or valid court orders.',
    content: [
      {
        subtitle: 'Compelled Disclosure',
        text: 'Where EAN Group has a good faith belief that such action is necessary to comply with a judicial proceeding, court order, warrant, administrative order, civil investigative demand, subpoena, or other valid process, EAN Group may disclose IP addresses, personal information, and any contents of the Site where it is legally compelled to do so.'
      },
      {
        subtitle: 'Cross-Reference to Privacy Policy',
        text: 'Please see the EAN Group’s Website Privacy Policy located at https://ean.aero/privacy-policy/ for additional information relating to the privacy and security of information collected hereunder.'
      }
    ]
  },
  {
    id: 'your-use',
    num: '08',
    title: 'Your Use of the Site',
    iconName: 'UserCheck',
    summary: 'Users assume total responsibility for User Content and must adhere strictly to prohibited conduct rules (no malware, harassment, spam, or framing).',
    content: [
      {
        subtitle: 'User Content Responsibility',
        text: 'You are solely responsible and liable for all data, information and other materials (“User Content”) that you submit, upload, post, e-mail or otherwise transmit (“Transmit”) in connection with the Site. In addition, we have no control over, and shall have no liability for, any damages resulting from the use (including without limitation republication) or misuse by any third party of information made public through the Site. IF YOU CHOOSE TO SUBMIT TO US, OR OTHERWISE MAKE ANY PERSONAL INFORMATION OR OTHER INFORMATION PUBLICLY AVAILABLE, YOU DO SO AT YOUR OWN RISK AND EAN GROUP SHALL HAVE NO RESPONSIBILITY OR LIABILITY THEREFORE.'
      },
      {
        subtitle: 'Prohibited Conduct Restrictions',
        text: 'You agree that you will not, and will not permit anyone else to, directly or indirectly: (a) Transmit any User Content that is unlawful, harmful, threatening, abusive, hateful, obscene, harassing, tortious, defamatory, libelous, slanderous, pornographic, profane, vulgar, offensive, lewd, invasive of another’s privacy or racially, ethnically or otherwise objectionable; (b) use the Site to harm minors in any way or to stalk, threaten, or otherwise violate the rights of others, including without limitation others’ privacy rights or rights of publicity, or harvest or collect personal information, including e-mail addresses, about other users of the Site; (c) Transmit any User Content: (i) that you do not have the right to Transmit, under any law or contractual or fiduciary relationships; (ii) that infringes any patent, copyright, trademark or other intellectual property right; (iii) that constitute unsolicited or unauthorized advertising or promotional materials, “spam,” “chain letters,” or pyramid schemes; or (iv) that contains any software routine, code, instruction or virus that is designed to disable, delete, modify, damage or erase software, hardware or data; (d) forge headers or otherwise manipulate identifiers in order to disguise any User Content Transmitted through the Site; (e) interfere with the Site or servers or networks used in connection with the Site; (f) interfere with the ability of others to use the Site; (g) reproduce, sell, resell, sub-license, distribute, publish create derivative works of, reverse engineer, assign, transfer or exploit for any commercial purposes, any portion of the Site, the Site Content or any User Content contained therein; (h) conduct your business using the Site in a way that is unfair, unlawful, or constitutes a deceptive business practice; (i) use any robot, spider, or other automatic device to monitor or copy portions of the Site or the Site Content without EAN Group’s prior written permission; (j) include in any thirty-party website any hypertext link to any page or location within the Site without EAN Group’s prior written permission; (k) display the Site or any portion thereof in frames without EAN Group’s prior written permission; or (m) impersonate any person or entity, including, but not limited to, other users of the Site, falsely state or otherwise misrepresent your affiliation with any person or entity, or express or imply that we endorse any statement you make.'
      },
      {
        subtitle: 'User Content License & Intellectual Property Development',
        text: 'You acknowledge and agree that EAN Group may disclose or use any User Content that you Transmit for purposes that include, but are not limited to: (a) enforcing these Terms and Conditions; (b) complying with any laws, regulations or rules of any federal, state or local government or agency; (c) responding to claims that any User Content violates the rights of third parties; or (d) protecting the rights or property of EAN Group, its customers or the public. With respect to User Content that you Transmit to the Site, you grant EAN Group a nonexclusive, royalty-free, perpetual, irrevocable, and fully sublicensable right to use, reproduce, modify, adapt, publish, translate, create derivate works from, distribute and display such User Content throughout the work in any media; however, EAN Group will only share personally identifiable information that you provide in accordance with EAN Group’s privacy policy at https://ean.aero/privacy-policy/. As between the parties, we own all right, title, and interest in and to all intellectual property rights in all materials, products or services developed by us, or on behalf of us by third parties, based on or including as a component thereof any such information as described above, and all generalized knowledge, skill, know-how and expertise relating to such information.'
      },
      {
        subtitle: 'Passive Conduit & Submission Moderation',
        text: 'EAN Group does not and cannot review all User Content posted to the Site, or created by users accessing the Site, and is not in any manner responsible for the content of any User Content. You acknowledge that by providing you with the ability to view and distribute user-generated content on the Site, EAN Group is merely acting as a passive conduit for such distribution and is not undertaking any obligation or liability relating to any User Content or activities on the Site. However, EAN Group reserves the right to block, remove, move or edit any of the submissions in its sole discretion.'
      }
    ]
  },
  {
    id: 'international-use',
    num: '09',
    title: 'Special Admonitions for International Use',
    iconName: 'Globe',
    summary: 'Hosted in Nigeria. International users accessing the site do so on their own initiative and are responsible for local compliance.',
    content: [
      {
        subtitle: 'Jurisdictional Hosting',
        text: 'This Site is hosted in Nigeria. While the Site is intended for use by persons located in Nigeria, it is also made available to international users who wish to access our services and products from other countries.'
      },
      {
        subtitle: 'Compliance Responsibilities',
        text: 'We make no claims that the Site or any of its content is accessible, appropriate, compliant with or available for use outside of Nigeria. Access to the Site may not be legal by certain persons or in certain countries. If you access the Site from outside Nigeria, you do so on your own initiative and are responsible for compliance with all applicable local laws.'
      }
    ]
  },
  {
    id: 'indemnification',
    num: '10',
    title: 'Indemnification',
    iconName: 'ShieldCheck',
    summary: 'You agree to defend and hold harmless EAN Group and its affiliates against any claims, losses, or legal fees resulting from your site usage.',
    content: [
      {
        subtitle: 'Indemnity Scope',
        text: 'You agree to hold harmless and indemnify EAN Group, its subsidiaries and affiliates, business partners, contractors, clients and service providers, and their respective officers, employees, agents and representatives from and against any claims, liabilities, costs or damages, including reasonable attorneys’ fees and paralegal fees through final appeals, made by any third party, relating to or arising from your use of the Site, any User Content that you Transmit to or through the Site, any violation of these Terms and Conditions by you, or any other act or omission by you, including your violation of any rights of another, arising from your use of the Site.'
      }
    ]
  },
  {
    id: 'availability',
    num: '11',
    title: 'Availability and Features',
    iconName: 'Clock',
    summary: 'Site features may change without notice. Maintenance shutdowns occur periodically for repairs and system upgrades.',
    content: [
      {
        subtitle: 'Service Changes & Maintenance Shutdowns',
        text: 'Availability and features of the EAN Group products or services featured on the Site are subject to change without notice. To keep the Site operating smoothly, we perform regular maintenance on the equipment and systems involved in the operation of the Site. From time to time, we may shut down the Site temporarily for repairs or upgrades.'
      }
    ]
  },
  {
    id: 'termination',
    num: '12',
    title: 'Termination',
    iconName: 'UserX',
    summary: 'EAN Group reserves the right to terminate access or modify features without prior notice or liability. Key legal covenants survive.',
    content: [
      {
        subtitle: 'Right of Termination & Rule Enforcement',
        text: 'You acknowledge and agree that EAN Group may terminate your access to use of the Site for any reason, including, without limitation, your violation of these Terms and Conditions. You agree that EAN Group may terminate your access to and use of the Site without prior notice and without any liability to you or any third party.'
      },
      {
        subtitle: 'Site Modification & Data Loss Disclaimer',
        text: 'You acknowledge and agree that EAN Group may modify, limit, suspend or discontinue the Site or any part of the Site at any time, without notice or liability to you. EAN Group may also, from time to time, establish general rules and policies regarding use of the Site. EAN Group will post such rules and policies on the Site, and you agree that your compliance with such rules and policies shall be a condition of your use or continued use of the Site. EAN Group shall have no liability or responsibility with respect to any lost Site Content, User Content, or other data, such as the deletion of or failure to store Site Content, User Content, or other data.'
      },
      {
        subtitle: 'Survival of Provisions',
        text: 'All provisions of these Terms and Conditions that by their nature should survive termination of your right to access and use the Site shall survive (including, but not limited to, all limitations on liability, releases, indemnification obligations, disclaimers of warranties, and intellectual property protections and licenses). EAN Group reserves the right to, but has no obligation to, store or keep copies of any Site Content, User Content, or other information, unless otherwise required by law or court order.'
      }
    ]
  },
  {
    id: 'disclaimers-liability',
    num: '13',
    title: 'Disclaimers and Limitation of Liability',
    iconName: 'AlertCircle',
    summary: 'Site is provided on an "AS-IS" basis. Maximum liability capped at total amount paid to EAN Group for site access.',
    content: [
      {
        subtitle: '"AS-IS" & "AS-AVAILABLE" Warranty Disclaimer',
        text: 'EAN Group is providing the site and all features of the site content on an “as-is,” “asavailable” basis. You expressly agree that your use of the site is at your sole risk. EAN group disclaims all representations or warranties of any kind to the extent that they may be excluded by law, including, but not limited to, warranties of merchantability and fitness for a particular purpose or non-infringement as to the operation of the site. EAN group does not warrant that the site will operate in an uninterrupted, secure or error-free manner. EAN group assumes no responsibility for and makes no warranty or representation as to the accuracy, currency, completeness, reliability, timeliness, usefulness, or decency of the site. EAN group makes no warranty regarding the quality, safety, or legality of the site, and EAN group does not warrant that your use of the site will meet your requirements or expectations.'
      },
      {
        subtitle: 'User Risk & Consequential Damages Exclusion',
        text: 'You assume total responsibility and risk for your use of the site. Any site content downloaded or otherwise obtained through your use of the site is at your own risk, and you will be solely responsible for any damage done to your computer or loss of data that results from such activity. In no event shall EAN group, or its subsidiaries, affiliates, officers, directors, employees, or agents (“affiliated entities”) be liable, whether in contract, tort (including without limitation negligence) or otherwise for any indirect, special, incidental, punitive, exemplary or consequential damages, including, but not limited to, loss of data or other intangibles, income or profit, loss of or damage to property or claims of third-parties, even if EAN group has been advised of the possibility of such damages, arising out of or resulting from (1) the use of or inability to use the site, any services, or the user content; (2) any transaction conducted through or facilitated by the site; (3) any claim attributable to errors, omissions, or other inaccuracies in the site, any services and/or user content; (4) unauthorized access to or alteration of your transmissions or data; or (5) any other matter relating to the site, any services, or the user content. You specifically agree that EAN group is not responsible or liable to you or anyone else for unlawful, harassing, defamatory, abusive, threatening, harmful, vulgar, obscene, sexually explicit, or otherwise objectionable conduct or speech of any other party on or through the site, or for any infringement or violation of your rights by any other party, including, but not limited to, intellectual property rights, rights of publicity, or rights of privacy.'
      },
      {
        subtitle: 'Exclusive Remedy & Liability Cap',
        text: 'Your sole and exclusive remedy for dissatisfaction with the site is to stop using the site. The maximum liability of EAN group and the affiliated entities for all damages, losses and causes of action, whether in contract, tort (including without limitation negligence) or otherwise will be the total amount, if any, paid by you to EAN group to access and use the site. If you live in a jurisdiction whose laws prevent you from taking full responsibility and risk for your use of the site in accordance with these terms and conditions, EAN group’s liability is limited to the greatest extent allowed by the law of that jurisdiction.'
      }
    ]
  },
  {
    id: 'governing-law',
    num: '14',
    title: 'Governing Law and Jurisdiction',
    iconName: 'Scale',
    summary: 'Governed by Nigerian law. Requires a 30-day amicable resolution attempt, followed by binding arbitration under the Arbitration and Mediation Act of Nigeria 2022.',
    content: [
      {
        subtitle: 'Governing Law',
        text: 'EAN Group operates the Site from its offices in Nigeria. These Terms and Conditions and the transactions they contemplate, including without limitation their interpretation, construction, performance and enforcement shall be governed by the laws of the Federal Republic of Nigeria. Without reference to conflict or choice of law provisions, as applicable to contracts made and performed entirely within such State. The International Convention on the Sale of Goods, and other international treaties that are not mandatory with respect to contracts made and performed entirely in Nigeria, shall not apply.'
      },
      {
        subtitle: 'Mandatory 30-Day Amicable Dispute Resolution',
        text: 'In the event of any complaint, dispute, or claim arising out of or in connection with the use of this Site, the User shall first submit a written complaint to the EAN Group and allow us a period of 30 (thirty) days from receipt to attempt to resolve the matter amicably.'
      },
      {
        subtitle: 'Binding Arbitration (Arbitration & Mediation Act 2022)',
        text: 'If the dispute remains unresolved after this period, the User may refer this matter to arbitration in accordance with the Arbitration and Mediation Act of Nigeria 2022, as may be amended from time to time.'
      },
      {
        subtitle: 'Urgent Injunctive Relief & Exclusive Forum',
        text: 'Nothing in this clause shall prevent or restrict either party from applying to a court of competent jurisdiction in Nigeria for urgent or injunctive relief where necessary. The exclusive forum for any such judicial proceedings relating to these Terms and Conditions shall be courts in Nigeria, and you agree to personal jurisdiction of such courts over you with regard to any dispute relating to these Terms and Conditions and agree to service of process on you by e-mail to the address you have submitted on the Site, if any, and by any other means permitted by law.'
      }
    ]
  },
  {
    id: 'miscellaneous',
    num: '15',
    title: 'Miscellaneous',
    iconName: 'FileCheck',
    summary: '12-month statute of limitations on claims. Severability, non-waiver, and complete agreement terms.',
    content: [
      {
        subtitle: 'Non-Assignment & Severability',
        text: 'You may not assign, sublicense or otherwise transfer any of your rights under these Terms and Conditions. If any provision of these Terms and Conditions is found to be invalid by any court having competent jurisdiction, the invalidity of that provision shall not affect the validity of the remaining provisions of this Agreement, which shall remain in full force and effect. Headings in these Terms and Conditions are for convenience only and shall have no legal meaning or effect.'
      },
      {
        subtitle: '12-Month Statute of Limitations',
        text: 'No action arising under this Agreement may be brought at any time more than twelve (12) months after the facts occurred upon which the cause of action arose.'
      },
      {
        subtitle: 'Entire Agreement & Non-Waiver',
        text: 'These Terms and Conditions, and not the conduct between us or any trade practice, shall control the interpretation of these Terms and Conditions between the parties respecting the Site. EAN Group’s failure to enforce a particular provision of these Terms and Conditions does not mean that EAN Group waives the right to enforce it in the future; EAN Group shall waive such a right only in writing. These Terms and Conditions and all other written agreements duly executed between you and EAN Group in connection with your use of the Site constitute the entire agreement between you and EAN Group with respect to the subject matter hereof and supersede any prior or contemporaneous proposals, discussions, communications, or oral agreements heretofore made.'
      }
    ]
  },
  {
    id: 'notice',
    num: '16',
    title: 'Notice & Contact Details',
    iconName: 'Mail',
    summary: 'Official physical address, phone, and email details for legal notices and terms violation reports.',
    content: [
      {
        subtitle: 'Official Address for Legal Notices',
        text: 'Notices given by you under these Terms and Conditions will be in writing and will be deemed given when delivered to: EAN Jet Center, Address: FAAN Transit Camp Road, Murtala Mohammed International Airport, Ikeja, Lagos State, Nigeria.'
      },
      {
        subtitle: 'Official Contact Channels',
        text: 'Phone: +234 (0) 1295 0960 / +234 (0) 805 033 3410 | Email: info@ean.aero. Any notices to you may be made via either e-mail or postal mail to the address in EAN Group’s records or via posting on the Site.'
      },
      {
        subtitle: 'Reporting Violations',
        text: 'Please report any violations of these Terms and Conditions to EAN Group at the contact listed above.'
      }
    ]
  }
];
