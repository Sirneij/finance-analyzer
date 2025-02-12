from unittest.mock import patch

from src.utils.base import get_device
from tests import BaseTestClass


class TestGetDevice(BaseTestClass):
    @patch('torch.cuda.is_available', return_value=True)
    def test_cuda_available(self, mock_cuda):
        device, name = get_device()
        self.assertEqual(device.type, 'cuda')
        self.assertEqual(name, 'CUDA (NVIDIA GPU)')

    @patch('torch.backends.mps.is_available', return_value=True)
    @patch('torch.cuda.is_available', return_value=False)
    def test_mps_available(self, mock_cuda, mock_mps):
        device, name = get_device()
        self.assertEqual(device.type, 'mps')
        self.assertEqual(name, 'MPS (Apple Metal)')

    @patch('torch.backends.mps.is_available', return_value=False)
    @patch('torch.cuda.is_available', return_value=False)
    def test_cpu_default(self, mock_cuda, mock_mps):
        device, name = get_device()
        self.assertEqual(device.type, 'cpu')
        self.assertEqual(name, 'CPU')
