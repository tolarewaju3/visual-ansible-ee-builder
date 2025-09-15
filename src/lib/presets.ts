import { Collection } from './storage';

export interface Preset {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseImage: string;
  collections: Collection[];
  requirements: string[];
  packages: string[];
}

export const PRESETS: Preset[] = [
  {
    id: 'basic-automation',
    name: 'Basic Automation',
    description: 'Perfect for getting started with Ansible automation. Includes essential collections for system management.',
    icon: '🚀',
    baseImage: 'registry.access.redhat.com/ubi9/python-311:latest',
    collections: [
      { name: 'ansible.posix'},
      { name: 'community.general'}
    ],
    requirements: [
      'requests>=2.25.1',
      'jinja2>=3.0.0',
      'jmespath>=1.0',
      'PyYAML>=6.0'
    ],
    packages: []
  },
  {
    id: 'network-automation',
    name: 'Network Automation',
    description: 'Specialized for network device management with major vendor collections and networking tools.',
    icon: '🌐',
    baseImage: 'registry.access.redhat.com/ubi9/python-311:latest',
    collections: [
      { name: 'cisco.ios'},
      { name: 'arista.eos'},
      { name: 'junipernetworks.junos'},
      { name: 'ansible.netcommon'}
    ],
    requirements: [
      'netmiko>=4.2.0',
      'paramiko>=3.3.1',
      'textfsm>=1.1.3',
      'ncclient>=0.6.13',
      'jinja2>=3.0.0'
    ],
    packages: [
      'telnet'
    ]
  },
  {
    id: 'cloud-management',
    name: 'Cloud Management',
    description: 'Comprehensive setup for managing AWS, Azure, and GCP resources with cloud-specific tools.',
    icon: '☁️',
    baseImage: 'registry.access.redhat.com/ubi9/python-311:latest',
    collections: [
      { name: 'amazon.aws'},
      { name: 'azure.azcollection'},
      { name: 'google.cloud'},
      { name: 'community.general'}
    ],
    requirements: [
      'boto3>=1.28.0',
      'botocore>=1.31.0',
      'requests>=2.25.1'
    ],
    packages: [
      'jq'
    ]
  },
  {
    id: 'container-orchestration',
    name: 'Container Orchestration',
    description: 'Built for Kubernetes and container management with Docker and OpenShift collections.',
    icon: '🐳',
    baseImage: 'registry.access.redhat.com/ubi9/python-311:latest',
    collections: [
      { name: 'kubernetes.core'},
      { name: 'community.docker'},
      { name: 'redhat.openshift'},
      { name: 'community.general'}
    ],
    requirements: [
      'kubernetes>=28.1.0',
      'docker>=6.1.0',
      'openshift>=0.13.2',
      'pyyaml>=6.0',
      'requests>=2.28',
    ],
    packages: []
  },
  {
    id: 'security-compliance',
    name: 'Security & Compliance',
    description: 'Security-focused setup with vulnerability scanning and compliance automation tools.',
    icon: '🔒',
    baseImage: 'registry.access.redhat.com/ubi9/python-311:latest',
    collections: [
      { name: 'community.crypto'},
      { name: 'community.general'},
      { name: 'ansible.posix'},
      { name: 'devsec.hardening'}
    ],
    requirements: [
      'cryptography>=41.0.0',
      'passlib>=1.7.4',
      'requests>=2.25.1',
      'PyYAML>=6.0',
      'jmespath>=1.0'
    ],
    packages: [
      'ca-certificates'
    ]
  }
];

export const getPresetById = (id: string): Preset | undefined => {
  return PRESETS.find(preset => preset.id === id);
};