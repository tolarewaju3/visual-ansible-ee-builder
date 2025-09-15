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
      { name: 'ansible.posix', version: '1.5.4' },
      { name: 'community.general', version: '8.1.0' }
    ],
    requirements: [
      'requests>=2.25.1',
      'jinja2>=3.0.0'
    ],
    packages: [
      'git',
      'curl'
    ]
  },
  {
    id: 'network-automation',
    name: 'Network Automation',
    description: 'Specialized for network device management with major vendor collections and networking tools.',
    icon: '🌐',
    baseImage: 'registry.access.redhat.com/ubi9/python-311:latest',
    collections: [
      { name: 'cisco.ios', version: '5.3.0' },
      { name: 'arista.eos', version: '6.2.2' },
      { name: 'junipernetworks.junos', version: '5.3.1' },
      { name: 'ansible.netcommon', version: '5.3.0' }
    ],
    requirements: [
      'netmiko>=4.2.0',
      'paramiko>=3.3.1',
      'textfsm>=1.1.3',
      'jinja2>=3.0.0'
    ],
    packages: [
      'openssh-clients',
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
      { name: 'amazon.aws', version: '7.0.0' },
      { name: 'azure.azcollection', version: '1.19.0' },
      { name: 'google.cloud', version: '1.3.0' },
      { name: 'community.general', version: '8.1.0' }
    ],
    requirements: [
      'boto3>=1.28.0',
      'botocore>=1.31.0',
      'azure-cli>=2.50.0',
      'google-cloud-compute>=1.14.0',
      'requests>=2.25.1'
    ],
    packages: [
      'curl',
      'jq'
    ]
  }
];

export const getPresetById = (id: string): Preset | undefined => {
  return PRESETS.find(preset => preset.id === id);
};